const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const axios = require('axios');
const verifyJWT = require("../User/middlewear/index");
const cors = require('cors');
const mongoose = require('mongoose');
const userModel = require('../User/connect');

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PORT = process.env.PORT2 || 3001;
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

// Get tracks from favorite artist
app.get('/music/favorite-artist-tracks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get user's favorite artist from database
        const user = await userModel.findById(userId);
        if (!user || !user.musicStyle) {
            return res.status(404).json({ message: 'User or favorite artist not found' });
        }

        // Get tracks from the favorite artist
        const response = await axios.get(`${JAMENDO_API_URL}/tracks`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 9,
                tags: user.musicStyle
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching favorite artist tracks:', error);
        res.status(500).json({ message: 'Error fetching favorite artist tracks' });
    }
});

// Get popular tracks
app.get('/music/popular', async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/tracks`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 10,
                orderby: 'popularity_total'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching popular tracks:', error);
        res.status(500).json({ message: 'Error fetching popular tracks' });
    }
});

// Get all tracks with search
app.get('/music/all', async (req, res) => {
    const { query } = req.query;
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/tracks`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 10,
                search: query
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error searching tracks:', error);
        res.status(500).json({ message: 'Error searching tracks' });
    }
});

// Get track by name
app.get('/music/search/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/tracks`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                name: name
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error getting track details:', error);
        res.status(500).json({ message: 'Error getting track details' });
    }
});

// Get user playlists
app.get('/playlists-user', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.playlists || []);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Error fetching playlists' });
  }
});

// Create new playlist
app.post('/playlists', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.headers.authorization?.split(' ')[1];
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const newPlaylist = {
      name,
      tracks: [],
      createdAt: new Date()
    };
    
    user.playlists = user.playlists || [];
    user.playlists.push(newPlaylist);
    await user.save();
    
    res.json({ success: true, playlist: newPlaylist });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Error creating playlist' });
  }
});

// Add track to playlist
app.post('/playlists/:playlistId/tracks', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId } = req.body;
    const userId = req.headers.authorization?.split(' ')[1];
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const playlist = user.playlists?.find(p => p._id.toString() === playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    if (!playlist.tracks.includes(trackId)) {
      playlist.tracks.push(trackId);
      await user.save();
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    res.status(500).json({ error: 'Error adding track to playlist' });
  }
});

app.listen(PORT, () => {
    console.log(`Music Service is running on port ${PORT}`);
});