const router = require('express').Router();
const Home = require('../models/Home');
const Formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// ******************** CLOUDINARY CONFIG ******************** //
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
// *********************************************************** //

router.post('/api/home-listing', (req, res) => {
    const form = new Formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        const {
            rent,
            country,
            state,
            city,
            address,
            bhk
        } = fields;

        const { homeImage } = files;

        cloudinary.uploader.upload(homeImage.path, { folder: '/realEstate/homes' }, async (err, res2) => {
            if (err) {
                console.log("Upload error ====>", err);
            }
            const img_url = res2.url;
            const newHome = new Home({
                location: {
                    country,
                    state,
                    city,
                    address
                },
                property_details: {
                    rent: rent,
                    bhk: bhk,
                    homeImage: img_url
                },
                applicants:[]
            });

            const savedHome = await newHome.save();
            return res.status(200).json(savedHome);
        })

    });
});

module.exports = router;