const mongoose = require('mongoose');
const cities = require('./cities');
const titles = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost/Yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }) //connection to mongoose
    .then(() => console.log('connected with mongoose'))
    .catch(err => console.log('Disconnected , ERROR:', err));

const title = (array) => {
    const random = Math.floor(Math.random() * array.length);
    return array[random];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 1; i <= 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000) + 1;
        const random20 = Math.floor(Math.random() * 20) + 1;
        const camp = new Campground({
            author: ['607aa5cfc1b67a08884f52ce'],
            title: `${title(titles.descriptors)} ${title(titles.places)}`,
            location: `${cities[random1000].city} , ${cities[random1000].state}`,
            geometry: { 
                type: 'Point', 
                coordinates: [ cities[random1000].longitude , cities[random1000].latitude ] 
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dvdu6rgqt/image/upload/v1619103292/YelpCamp/czmtunmafxl9g5v856dn.jpg',
                    filename: 'YelpCamp/czmtunmafxl9g5v856dn'
                },
                {
                    url: 'https://res.cloudinary.com/dvdu6rgqt/image/upload/v1619094618/YelpCamp/plu0ztex7niv5pvm6wae.jpg',
                    filename: 'YelpCamp/plu0ztex7niv5pvm6wae'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Non consequatur eos officiis laborum laboriosam nesciunt, ducimus qui odit ab error quidem exercitationem necessitatibus delectus quis aliquam porro maiores soluta nostrum.',
            price: random20 * 100,
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})