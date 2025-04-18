const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const { route } = require("./listing.js");
const { validateReview, isLoggedIn } = require("../middleware.js");
const reviewController = require("../controllers/review.js");



// comments/reviews
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));
//Delete reviews
router.delete("/:reviewId", isLoggedIn, wrapAsync(reviewController.deleteReview));


module.exports = router;