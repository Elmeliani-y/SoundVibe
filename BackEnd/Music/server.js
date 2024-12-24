const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const axios = require('axios');
const verifyJWT = require("../User/middlewear/index");
const cors = require('cors');
const mongoose = require('mongoose');
const userModel = require('../User/connect');
const debug = require('debug')('soundvibe:music');

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

// Error handling middleware
app.use((err, req, res, next) => {
  debug('Error occurred:', err);
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    details: err
  });
  res.status(500).json({ error: err.message || 'Internal server error' });
});

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

// Like a track
app.post('/music/like/:trackId', verifyJWT, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.favoriteTracks) {
      user.favoriteTracks = [];
    }

    // Check if track is already in favorites
    const existingTrack = user.favoriteTracks.find(track => track.trackId === trackId);
    if (!existingTrack) {
      try {
        // Get track details from Jamendo
        const response = await axios.get(`${JAMENDO_API_URL}/tracks`, {
          params: {
            client_id: JAMENDO_CLIENT_ID,
            format: 'json',
            id: trackId
          }
        });

        if (!response.data.results || response.data.results.length === 0) {
          return res.status(404).json({ error: 'Track not found on Jamendo' });
        }

        const track = response.data.results[0];
        
        // Add track to favorites with correct schema fields
        user.favoriteTracks.push({
          trackId: track.id,
          name: track.name,
          artist: track.artist_name,
          image: track.image || 'default-image.jpg',
          addedAt: new Date()
        });

        await user.save();
      } catch (jamendoError) {
        console.error('Error fetching track from Jamendo:', jamendoError);
        return res.status(500).json({ error: 'Error fetching track details from Jamendo' });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error liking track:', error);
    res.status(500).json({ error: 'Error liking track' });
  }
});

// Unlike a track
app.delete('/music/unlike/:trackId', verifyJWT, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.favoriteTracks) {
      user.favoriteTracks = user.favoriteTracks.filter(track => track.trackId !== trackId);
      await user.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error unliking track:', error);
    res.status(500).json({ error: 'Error unliking track' });
  }
});

// Check if track is in favorites
app.get('/music/check-favorite/:trackId', verifyJWT, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isLiked = user.favoriteTracks?.some(track => track.trackId === trackId) || false;
    res.json({ isLiked });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ error: 'Error checking favorite status' });
  }
});

// Get user's favorite tracks
app.get('/music/favorites', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ tracks: user.favoriteTracks });
  } catch (error) {
    console.error('Error fetching favorite tracks:', error);
    res.status(500).json({ message: 'Error fetching favorite tracks' });
  }
});

app.listen(PORT, () => {
    console.log(`Music Service is running on port ${PORT}`);
});