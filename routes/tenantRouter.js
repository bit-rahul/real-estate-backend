const router = require('express').Router();
const Tenant = require('../models/Tenant');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');

// ********************** TENANT ROUTE ********************** //

router.get("/api/tenant", auth, async (req, res) => {
    const tenant = await Tenant.findById(req.tenant);
    res.json({
        id: tenant._id,
        name: tenant.name,
        email: tenant.email,
        contact: tenant.contact
    });
})

router.post('/api/tenant/register', async (req, res) => {
    try {
        const {
            name,
            contact,
            email,
            password,
            password2
        } = req.body;

        // ********************** VALIDATIONS ********************** //
        if (!email || !password || !password2 || !name || !contact) {
            console.log("reqq", req.body)
            return res.status(400).json({
                message: "Missing fields!"
            })
        }
        if (password.length < 5)
            return res.status(400).json({
                message: "Password must be atleast 5 characters!"
            })
        if (password !== password2)
            return res.status(400).json({
                message: "Passwords Mismatch!"
            })

        const existingTenant = await Tenant.findOne({ email })
        if (existingTenant)
            return res
                .status(400)
                .json({
                    message: "An account with this email already exists!"
                })

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newTenant = new Tenant({
            name,
            contact,
            email,
            password: passwordHash,
            applied: []
        })

        await newTenant.save();

        return res
            .status(200)
            .json({
                message: "Account created successfully!"
            })
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.post('/api/tenant/login', async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // ********************** VALIDATIONS ********************** //
        if (!email || !password) {
            console.log("reqq", req.body)
            return res.status(400).json({
                message: "Missing fields!"
            })
        }

        const tenant = await Tenant.findOne({ email })
        if (!tenant)
            return res
                .status(400)
                .json({
                    message: "Account with this email does not exist!"
                })

        const matchPass = await bcrypt.compare(password, tenant.password);
        if (!matchPass)
            return res
                .status(400)
                .json({
                    message: "Invalid credentials!"
                })

        const token = jwt.sign({ id: tenant._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res
            .status(200)
            .json({
                token,
                id: tenant._id,
                name: tenant.name,
                email: tenant.email,
                contact: tenant.contact
            })

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.post("/api/tenant/isTokenValid", async (req, res) => {
    try {
        const token = req.header("token");
        if (!token) return res.json(false);

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) return res.json(false);

        const tenant = await Tenant.findById(verified.id);
        if (!tenant) return res.json(false);

        return res.json(true);
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})

router.delete("/api/tenant/delete", auth, async (req, res) => {
    try {
        const deletedTenant = await Tenant.findByIdAndDelete(req.tenant);
        res.json(deletedTenant)
    } catch (error) {

    }
})

// *********************************************************** //

module.exports = router;