const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    musicStyle: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: '/assets/default-profile.png'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
