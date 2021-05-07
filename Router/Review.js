const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const review = require('../models/review');
const AsyncWrap = require('../views/utilities/AsyncWrap');
const { ValidateReview, isLoggedIn, isCommenter } = require('./Middleware');
const ExpressError = require('../views/utilities/ExpressErrors');
const Reviews = require('../controllers/reviews');


//posting a review
router.post('/', isLoggedIn, ValidateReview, AsyncWrap(Reviews.addReview));

router.delete('/:reviewId', isLoggedIn, isCommenter, AsyncWrap(Reviews.deleteReview));

module.exports = router;
