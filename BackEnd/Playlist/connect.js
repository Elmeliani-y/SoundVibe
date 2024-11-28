const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

MONGODB_URL = process.env.MONGODB_URL;
console.log('MONGODB_URL:', MONGODB_URL);
mongoose.connect(MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Failed to connect to MongoDB:", err));

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    tracks: [{ type: String }],
    owner: { type: String, required: true },
    collaborators: [{ type: String }]
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);

module.exports = Playlist;