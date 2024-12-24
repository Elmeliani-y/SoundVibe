const express = require('express');
const cors = require('cors');
const verifyJWT = require('../User/middlewear/index');
const Playlist = require('./connect');
const axios = require('axios');

const app = express();
const PORT = 3002;
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

// Enable CORS with proper configuration
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Get user playlists
app.get('/playlists-user', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const playlists = await Playlist.find({ owner: userId });
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Error fetching playlists' });
  }
});

// Create new playlist
app.post('/playlists/new-pl', verifyJWT, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const newPlaylist = new Playlist({
      name,
      description,
      tracks: [],
      owner: userId,
      collaborators: []
    });

    await newPlaylist.save();
    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Error creating playlist' });
  }
});

// Check if track is in any playlist
app.get('/playlists/check-track/:trackId', verifyJWT, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({
      owner: userId,
      'tracks.trackId': trackId
    });

    res.json({ isInPlaylist: !!playlist });
  } catch (error) {
    console.error('Error checking track:', error);
    res.status(500).json({ error: 'Error checking track' });
  }
});

// Add track to playlist
app.post('/playlists/:playlistId/tracks', verifyJWT, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId } = req.body;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check if track already exists in playlist
    const trackExists = playlist.tracks.some(track => track.trackId === trackId);
    if (trackExists) {
      return res.json({ success: true, message: 'Track already in playlist' });
    }

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
    
    // Add track to playlist
    playlist.tracks.push({
      trackId: track.id,
      name: track.name,
      artist: track.artist_name,
      image: track.image || 'default-image.jpg',
      audio_url: track.audio
    });

    await playlist.save();
    res.json({ success: true, playlist });
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    res.status(500).json({ error: 'Error adding track to playlist' });
  }
});

// Remove track from playlist
app.delete('/playlists/:playlistId/tracks/:trackId', verifyJWT, async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    playlist.tracks = playlist.tracks.filter(track => track.trackId !== trackId);
    await playlist.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing track from playlist:', error);
    res.status(500).json({ error: 'Error removing track from playlist' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Playlist microservice is running on port ${PORT}`);
});
