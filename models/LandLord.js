const mongoose = require('mongoose');

const LandLordSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    encryptedPassword: {
        type: String,
        required: true,
        minlength: 5
    }
}, {
    timestamps: true
});

const LandLord = mongoose.model('LandLord', LandLordSchema);

module.exports = LandLord;
