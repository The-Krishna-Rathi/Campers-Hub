const Campground = require('../models/campground');
const review = require('../models/review');

//posting the review to the database
module.exports.addReview = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    const newReview = new review(req.body);
    newReview.commenter = req.user._id; //saving commenter id to the review
    foundCampground.reviews.push(newReview);
    await foundCampground.save();
    await newReview.save();
    req.flash('success', 'Thanks for the review');
    res.redirect(`/campground/${id}`);
}

//finding and deleting review from the database
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await review.findByIdAndDelete(reviewId);
    req.flash('success', 'successfully Deleted the Review');
    res.redirect(`/campground/${id}`);
}