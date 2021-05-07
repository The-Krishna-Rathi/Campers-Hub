const { campgroundSchema, reviewSchema } = require('../views/ValidatorSchema/campgroundSchema');
const ExpressError = require('../views/utilities/ExpressErrors');
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnto = req.originalUrl; //copying the original route where user was going so that we could redirect useer after login to same route
        req.flash('error', 'You must be signed in');
        return res.redirect('/user/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const Camp = await Campground.findById(id);
    if (!Camp.author.equals(req.user._id)) {
        req.flash('error', "You don't have permission to access that");
        return res.redirect(`/campground/${Camp._id}`);
    }
    next();
}

module.exports.isCommenter = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.commenter.equals(req.user._id)) {
        req.flash('error', "You don't have permission to access that");
        return res.redirect(`/campground/${Camp._id}`);
    }
    next();
}

module.exports.ValidateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
