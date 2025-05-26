const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");


main()
    .then(() => console.log("connected to db"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/TripNest');
}


const initDB = async () => {
    await Listing.deleteMany({});
    initdata.sampleListings = initdata.sampleListings.map((obj) => ({ ...obj, owner: '67fb2ec6829a3fb56328d874' }))
    await Listing.insertMany(initdata.sampleListings);
    console.log("data was initialised");
}

initDB();