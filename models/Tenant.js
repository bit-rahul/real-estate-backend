const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    applied: []
}, {
    timestamps: true
});

const Tenant = mongoose.model('Tenant', TenantSchema);

module.exports = Tenant;
