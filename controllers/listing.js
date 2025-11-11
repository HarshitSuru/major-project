const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const { category, minPrice, maxPrice } = req.query;
    let query = {};

    if (category) {
        query.category = category;
    }

    if (minPrice || maxPrice) {
        query.price = {};

        if (minPrice) {
            query.price.$gte = parseInt(minPrice);
        }

        if (maxPrice) {
            query.price.$lte = parseInt(maxPrice);
        }
    }

    const allListings = await Listing.find(query);
    res.render("listings/index.ejs", {
        allListings,
        currentCategory: category,
        currentMinPrice: minPrice,
        currentMaxPrice: maxPrice
    });
}

module.exports.renderNewListing = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.createListing = async (req, res) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
        .send()

    const newListing = new Listing(req.body.listing);
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    }
    newListing.owner = req.user._id;
    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect("/listings");
}


module.exports.renderEditListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Couldn't find the given listing");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    const updatedListingData = { ...req.body.listing };

    if (req.body.listing.location) {
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        }).send();
        if (response && response.body && response.body.features && response.body.features.length > 0) {
            updatedListingData.geometry = response.body.features[0].geometry;
        } else {
            console.log("Geocoding failed or returned no results for location: ", req.body.listing.location);
        }
    }

    const listing = await Listing.findByIdAndUpdate(id, updatedListingData, { new: true, runValidators: true });

    if (typeof req.file !== "undefined") {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "listing is deleted");
    console.log(deletedListing);
    res.redirect("/listings");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Couldn't find the given listing");
        return res.redirect("/listings");   // <--- return added
    }
    return res.render("listings/show", { listing });
}

// New controller function for handling search
module.exports.searchListings = async (req, res) => {
    const { q } = req.query; // Get the search query from the 'q' parameter
    let listings = [];

    if (q) {
        // Use $regex for case-insensitive search in title or location
        const searchQuery = {
            $or: [
                { title: { $regex: q, $options: "i" } }, // Case-insensitive search for title
                { location: { $regex: q, $options: "i" } } // Case-insensitive search for location
            ]
        };
        listings = await Listing.find(searchQuery);
    }

    // Render a new view for search results, passing the listings and the query
    res.render("listings/search_results", { listings, query: q });
};