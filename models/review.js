
const mongoose = require('mongoose');
Schema = mongoose.Schema;
const User = require('./user');

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    commenter: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;