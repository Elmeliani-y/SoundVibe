const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const axios = require('axios');
const Playlist = require('./connect');
const verifyJWT = require('../User/middlewear/index');

dotenv.config();

const app = express();
const PORT = process.env.PORT3 || 3002 ;
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';

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

app.get('/playlists-user', verifyJWT, async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.user.id });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching playlists' });
    }
});
app.post('/playlists/new-pl', verifyJWT, async (req, res) => {
    const { name, description} = req.body;
    try {
        const newPlaylist = new Playlist({
            name,
            description,
            owner: req.user.id
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
app.post('/playlists/:playlistId/add-songs', verifyJWT, async (req, res) => {
    const { playlistId } = req.params;
    const { songId } = req.body;
    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }
        if (playlist.owner !== req.user.id && !playlist.collaborators.includes(req.user.id)) {
            return res.status(403).json({ message: 'You do not have permission to add songs to this playlist' });
        }
        playlist.tracks.push(songId);
        await playlist.save();
        res.json({ message: 'Song added to playlist', playlist });
    } catch (error) {
        res.status(500).json({ message: 'Error adding song to playlist' });
    }
});

app.listen(PORT, () => {
    console.log(`Playlist microservice is running on port ${PORT}`);
});
