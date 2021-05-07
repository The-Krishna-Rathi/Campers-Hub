const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CloudName,
    api_key: process.env.CloudKey,
    api_secret: process.env.CloudSecret
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp',
        allowedFormats: ['png', 'jpg', 'jpeg']
    }
})

module.exports = { cloudinary, storage }
