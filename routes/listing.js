const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const passport = require("passport");
const { isLoggedIn, isOwner } = require("../middleware.js");
const { validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require('multer')
const { storage } = require('../cloudConfig');
const upload = multer({ storage });


//index route
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

//add new listings new route rendering
router.get("/new", listingController.renderNewListing);

//edit router
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditListing));

//update router
router.route("/:id")
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))
    .get(wrapAsync(listingController.showListing));


module.exports = router;