const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URL = process.env.MONGODB_URL;
console.log('MONGODB_URL:', MONGODB_URL); 
if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined in .env file");
}

mongoose.connect(MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Failed to connect to MongoDB:", err));

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true
    },
    lastname: { 
        type: String, 
        required: [true, 'Last name is required'],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    musicStyle: { 
        type: String,
        trim: true,
        default: ''
    },
    profilePicture: { 
        type: String,
        default: 'default-profile.jpg'
    },
    favArtists: [{
        type: String,
        ref: 'Artist'
    }],
    likedPlaylists: [{
        type: String,
        ref: 'Playlist'
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for user's full name
UserSchema.virtual('fullName').get(function() {
    return `${this.name} ${this.lastname}`;
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
