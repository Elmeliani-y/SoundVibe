const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/SoundVibe';
console.log('MONGODB_URL:', MONGODB_URL);

if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined in .env file");
}

// MongoDB connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

// Connect to MongoDB with retry logic
async function connectWithRetry() {
    try {
        await mongoose.connect(MONGODB_URL, mongooseOptions);
        console.log("Successfully connected to MongoDB");
        
        // Log when the connection is lost
        mongoose.connection.on('disconnected', () => {
            console.log('Lost MongoDB connection...');
            // Try to reconnect
            setTimeout(connectWithRetry, 5000);
        });
        
        // Log any errors
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // Retry connection after 5 seconds
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
}

// Initial connection
connectWithRetry();

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
    favArtists: {
        type: [String],
        default: [],
        ref: 'Artist'
    },
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

const User = mongoose.model('User', UserSchema, 'user');
module.exports = User;
