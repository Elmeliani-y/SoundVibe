const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const axios = require('axios');
const Playlist = require('./connect');
const verifyJWT = require('../User/middlewear/index');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT3 || 3002 ;
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: true,
    })
);

app.get('/playlists-Api', verifyJWT, async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/playlists`, {
            params: {
                client_id: process.env.JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 10
            }
        });
        const jamendoPlaylists = response.data.results;
        res.json(jamendoPlaylists);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching playlists', error: error.message });
    }
});

app.get('/playlists-user', async (req, res) => {
    try {
        // For testing, use a default user ID
        const userId = 'user1';
        const playlists = await Playlist.find({ owner: userId });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching playlists' });
    }
});

app.post('/playlists/new-pl', async (req, res) => {
    const { name, description } = req.body;
    try {
        // For testing, use a default user ID
        const userId = 'user1';
        const newPlaylist = new Playlist({
            name,
            description,
            owner: userId,
            tracks: []
        });
        await newPlaylist.save();
        res.status(201).json(newPlaylist);
    } catch (error) {
        res.status(500).json({ message: 'Error creating playlist' });
    }
});

app.get('/playlists/:playlistId', verifyJWT, async (req, res) => {
    const { playlistId } = req.params;
    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }
        if (playlist.owner !== req.user.id && !playlist.collaborators.includes(req.user.id)) {
            return res.status(403).json({ message: 'You do not have permission to view this playlist' });
        }
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching playlist' });
    }
}); 

app.post('/playlists/:playlistId/tracks', async (req, res) => {
    const { playlistId } = req.params;
    const { trackId } = req.body;
    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }
        
        if (!playlist.tracks.includes(trackId)) {
            playlist.tracks.push(trackId);
            await playlist.save();
        }
        
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ message: 'Error adding track to playlist' });
    }
});

app.get('/playlists/check-track/:trackId', async (req, res) => {
    const { trackId } = req.params;
    try {
        // For testing, use a default user ID
        const userId = 'user1';
        const playlists = await Playlist.find({ owner: userId });
        const isInPlaylist = playlists.some(playlist => playlist.tracks.includes(trackId));
        res.json(isInPlaylist);
    } catch (error) {
        res.status(500).json({ message: 'Error checking track in playlists' });
    }
});

app.listen(PORT, () => {
    console.log(`Playlist microservice is running on port ${PORT}`);
});
