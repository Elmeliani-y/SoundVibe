const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

MONGODB_URL = process.env.MONGODB_URL;
console.log('MONGODB_URL:', MONGODB_URL);
mongoose.connect(MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Failed to connect to MongoDB:", err));

const TrackSchema = new mongoose.Schema({
    trackId: { type: String, required: true },
    name: { type: String, required: true },
    artist: { type: String, required: true },
    image: { type: String },
    audio_url: { type: String },
    addedAt: { type: Date, default: Date.now }
});

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    tracks: [{ type: String }],
    owner: { type: String, required: true },
    collaborators: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
PlaylistSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);

module.exports = Playlist;