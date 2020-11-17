const router = require('express').Router();
const LandLord = require('../models/LandLord');
const bcrypt = require('bcryptjs');

// ******************** FETCH HOMES ROUTE ******************** //
router.get('/', function (req, res) {
    res.render('register')
});
// *********************************************************** //

// ***************** REGISTER LANDLORD ROUTE ***************** //
router.post('/', async (req, res) => {
    console.log(req.body)
    try {
        const {
            name,
            contact,
            email,
            password,
            password2
        } = req.body;

        // ********************** VALIDATIONS ********************** //
        let errors = [];
        if (!email || !password || !password2 || !name || !contact) {
            errors.push({ msg: 'Please enter all fields' });
        }
        if (password.length < 5)
            errors.push({ msg: 'Password must be atleast 5 characters!' });

        if (password !== password2)
            errors.push({ msg: 'Passwords Mismatch!' });

        if (errors.length > 0) {
            res.render('register', {
                errors,
                name,
                contact,
                email
            });
        } else {
            const existingLandLord = await LandLord.findOne({ email })
            if (existingLandLord) {
                errors.push({ msg: 'Email ID already exists' });
                res.render('register', {
                    errors,
                    name,
                    contact,
                    email
                });
            }

            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);

            const newLandLord = new LandLord({
                name,
                contact,
                email,
                encryptedPassword: passwordHash
            })

            await newLandLord.save();
            req.flash(
                'success_msg',
                'You are now registered and can log in'
            );
            res.redirect('/admin');
        }
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});
// *********************************************************** //

module.exports = router;