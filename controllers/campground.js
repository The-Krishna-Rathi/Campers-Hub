const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geoCoder = mbxGeocoding({ accessToken: process.env.MapboxToken })

//listing campgrounds routes
module.exports.allCampgroundsHome = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index.ejs', { campgrounds })
}

//creating a campground..
module.exports.addCampgroundRender = (req, res) => {
    res.render('campground/add.ejs');
}

//adding/posting the new campground to database
module.exports.addCampground = async (req, res) => {
    // if (!req.body) throw new ExpressError('Invalid Campground Data', 404);
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    const newCampground = new Campground(req.body);
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.author = req.user._id; //setting author of created campground
    await newCampground.save();
    req.flash('success', 'successfully created a new Campground');
    res.redirect(`/campground/${newCampground._id}`);
}

//show route for each campground..
module.exports.ShowCampground = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id).populate({ path: 'reviews', populate: { path: 'commenter' } }).populate('author');
    if (!foundCampground) {
        req.flash('error', "Cannot Find Campground");
        res.redirect('/campground');
    }

    res.render('campground/show.ejs', { foundCampground });
}

//route for showing the update page..
module.exports.updateCampgroundRender = async (req, res) => {
    const { id } = req.params;
    const Camp = await Campground.findById(id);
    res.render('campground/update.ejs', { Camp });
}

//route for updating data in database
module.exports.updateCampground = async (req, res) => {
    if (!req.body) throw new ExpressError('Invalid Campground Data', 404);
    const { id } = req.params;
    const Camp = await Campground.findByIdAndUpdate(id, req.body);
    const newImgs = req.files.map(f => ({ url: f.path, filename: f.filename })); //copying new images in newImgs array
    Camp.images.push(...newImgs); //adding new images to campground using update
    await Camp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        await Camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'successfully updated Campground');
    res.redirect(`/campground/${Camp._id}`);
}

//delete route..
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const Camp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully Deleted Campground');
    res.redirect('/campground');
}