const router = require('express').Router();
const Home = require('../models/Home');
const Tenant = require('../models/Tenant');
const Formidable = require('formidable');
const mongoose = require('mongoose');

// ******************** FETCH HOMES ROUTE ******************** //
router.get('/api/properties', async (req, res) => {
    if (!(Object.keys(req.query).length === 0 && req.query.constructor === Object)) {
        const { city, state, country, bhk, rentMin, rentMax } = req.query;
        let query = { $and: [] };
        if (city || state || country) {
            if (city && state && country) {
                query.$and.push(
                    { "location.country": country }
                );
                query.$and.push(
                    { "location.state": state }
                );
                query.$and.push(
                    { "location.city": city }
                );
            } else if (state && country) {
                query.$and.push(
                    { "location.country": country }
                );
                query.$and.push(
                    { "location.state": state }
                );
            } else {
                query.$and.push(
                    { "location.country": country }
                );
            }
        }
        if (bhk) {
            query.$and.push(
                { "property_details.bhk": bhk }
            );
        }
        if (rentMax || rentMin) {
            if (rentMax)
                query.$and.push(
                    { "property_details.rentMax": rentMax }
                );
            if (rentMin)
                query.$and.push(
                    { "property_details.rentMin": rentMin }
                );
        }
        try {
            Home.find(query)
                .exec()
                .then(data => {
                    data.map((dt) => {
                        delete dt.applicants;
                    })
                    return res.status(200).json(data)
                })
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    } else {
        try {
            Home.find()
                .exec()
                .then(data => {
                    return res.status(200).json(data)
                })
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }
})
// *********************************************************** //

// **************** FETCH APPLIED PROPERTIES **************** //
router.get('/api/properties/isApplied', async (req, res) => {
    const { id, tenantID, status } = req.query;

    Home.find(
        { "_id": mongoose.Types.ObjectId(id), "applicants.tenantID": mongoose.Types.ObjectId(tenantID) },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                if (result.length !== 0)
                    result[0].applicants.map((resp) => {
                        if (resp.tenantID == tenantID) {
                            return res.json({
                                status: resp.status
                            })
                        }

                    })
                else return res.json({
                    status: "not applied"
                })
            }
        }
    );


    // let home = await Home.findById(id);
    // let found = home.applicants.filter(hm => hm.tenantID == tenantID)
    // if (found.length > 0) return res.status(200).json(true)
    // else return res.status(200).json(false)
})
// ********************************************************** //

// *********** FETCH APPLIED PROPERTIES BY TENANT *********** //
router.get('/api/properties/applied/:id', async (req, res) => {
    Home.find(
        { "applicants.tenantID": mongoose.Types.ObjectId(req.params.id) },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                if (result.length > 0) {
                    result.map((res) => {
                        let applicants = [];
                        res.applicants.map((appl) => {
                            if (appl.tenantID == req.params.id)
                                applicants.push(appl);
                        })
                        res.applicants = applicants;
                    })
                }
                return res.json(result);
            }
        }
    );
})
// ********************************************************** //

// ******************** APPLY HOMES ROUTE ******************** //
router.post('/api/home-apply/:id', (req, res) => {
    const { id } = req.params;
    const form = new Formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        const { name, email, contact, message, tenantID } = fields;
        Home.findById(id, function (err, home) {
            if (err) {
                console.log("ERROR: ", err);
                res.send(500, err);
            } else {
                let filtered = home.applicants.filter(ap => ap.email === email)
                if (filtered.length > 0)
                    res.status(500).json({
                        message: "Your last application is still pending! Please wait for approval."
                    })
                else {
                    Home.findOneAndUpdate(
                        { "_id": id },
                        { $push: { "applicants": { tenantID: mongoose.Types.ObjectId(tenantID), name, email, contact, message } } },
                        { safe: true, upsert: true, new: true },
                        function (err, model) {
                            if (err) {
                                console.log("ERROR: ", err);
                                res.send(500, err);
                            } else {
                                Tenant.findOneAndUpdate(
                                    { "_id": mongoose.Types.ObjectId(tenantID) },
                                    { $push: { "applied": mongoose.Types.ObjectId(id) } },
                                    { safe: true, upsert: true, new: true },
                                    function (err, model) {
                                        if (err) {
                                            console.log("ERROR: ", err);
                                            res.send(500, err);
                                        } else {
                                            res.status(200).json({
                                                message: "Applied Successfully!"
                                            });
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        });
    });
});
// *********************************************************** //

module.exports = router;