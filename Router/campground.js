const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campground');
const AsyncWrap = require('../views/utilities/AsyncWrap');
const { isLoggedIn, isAuthor, validateCampground } = require('./Middleware');
const { storage } = require('../cloudinary/index');
var multer = require('multer') // middleware for managing photo uploads of form send as enctype="multipart/form-data"
var upload = multer({ storage }) //destination to save the uploaded images

router.route('/')
    .get(AsyncWrap(campgrounds.allCampgroundsHome))//listing campgrounds routes
    .post(isLoggedIn, upload.array('image'), validateCampground, AsyncWrap(campgrounds.addCampground))//adding/posting the new campground to database
// .post(upload.array('image'), (req, res) => {
//     console.log(req.body, req.files);
//     res.send('It worked!!!');
// })

router.get('/add', isLoggedIn, campgrounds.addCampgroundRender)//creating a campground..

router.route('/:id')
    .get(AsyncWrap(campgrounds.ShowCampground))//show route for each campground..
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, AsyncWrap(campgrounds.updateCampground))//route for updating data in database
    .delete(isLoggedIn, isAuthor, AsyncWrap(campgrounds.deleteCampground))//delete route..

router.get('/:id/update', isLoggedIn, isAuthor, AsyncWrap(campgrounds.updateCampgroundRender))//route for showing the update page..

module.exports = router;