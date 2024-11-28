const express= require("express");
const mongoose = require("mongoose");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
//const { reviewSchema } = require ("../schema.js");
const Review = require ("../Models/review.js");
const Listing = require("../Models/listing.js");
const {validateReview} = require("../middleware.js");
 



//Reviews Post Route

router.post("/", wrapAsync(async (req, res) => {
let listing = await Listing.findById(req.params.id);
if (!listing) {
    return res.status(404).send("Listing not found");
}

let newReview = new Review(req.body.review);

listing.reviews.push(newReview);

await newReview.save();
await listing.save();
req.flash("success", "New Review Created");
res.redirect(`/listings/${listing.id}`);
}));


router.delete("/:reviewId", async (req, res) => {
let { id, reviewId } = req.params;

if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).send("Invalid Listing ID or Review ID");
}

// Pull the review from the listing
await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
});

// Delete the review from the Review model
await Review.findByIdAndDelete(reviewId);
req.flash("success", " Review Deleted");
res.redirect(`/listings/${id}`);
});

module.exports = router;