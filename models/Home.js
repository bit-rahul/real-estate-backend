const mongoose = require('mongoose');
const LandLord = require('./LandLord');

const HomeSchema = mongoose.Schema({
    isFeatured: {
        type: Boolean,
        default: false
    },
    location: {
        country: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    property_details: {
        rent: {
            type: Number,
            required: true
        },
        bhk: {
            type: Number,
            required: true
        },
        homeImage: {
            type: String,
            required: true
        }
    },
    applicants: [{
        tenantID: {
            type: Object,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        contact: {
            type: Number,
            required: true
        },
        message: {
            type: String,
            required: false
        },
        status: {
            type: String,
            default: 'pending',
            enum: ['accepted', 'pending', 'rejected']
        }
    }],
    landlordID: {
        type: mongoose.Types.ObjectId,
        ref: 'LandLord'
    }
    // landlord_details: {
    //     name: {
    //         type: String,
    //         required: true
    //     },
    //     landlordID: {
    //         type: Number,
    //         required: true
    //     },
    //     contact: {
    //         type: Number,
    //         required: true
    //     },
    //     email: {
    //         type: String,
    //         required: true
    //     }
    // },
    // booking_details: {
    //     name: {
    //         type: String,
    //         required: true
    //     },
    //     tenantID: {
    //         type: Number,
    //         required: true
    //     },
    //     contact: {
    //         type: Number,
    //         required: true
    //     },
    //     email: {
    //         type: String,
    //         required: true
    //     }
    // }
}, {
    timestamps: true
});

const Home = mongoose.model('Home', HomeSchema);

module.exports = Home;
