const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Enable CORS
app.use(cors());
app.use(express.json());

// Sample playlists data


// Get all playlists
app.get('/playlists-Api', (req, res) => {
    const limit = parseInt(req.query.limit) || playlists.length;
    res.json(playlists.slice(0, limit));
});

// Start server
app.listen(PORT, () => {
    console.log(`Playlist microservice is running on port ${PORT}`);
});
