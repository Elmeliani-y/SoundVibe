const express = require('express');
require('dotenv').config();
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT4 || 3003;

// Create FavArtist Schema
const favArtistSchema = new mongoose.Schema({
    userId: { type: String, required: true }, 
    artists: [{
        id: String,
        name: String,
        image: String,
        joindate: String,
        website: String,
        shorturl: String,
        shareurl: String
    }],
    createdAt: { type: Date, default: Date.now }
});

const FavArtist = mongoose.model('FavArtist', favArtistSchema);

const userModel = require('../User/connect');

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json());

const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = 'f9409435';

// Function to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to fetch artists with images
async function fetchArtists() {
    try {
        console.log('Fetching 50 artists with images...');
        const response = await axios.get(`${JAMENDO_API_URL}/artists/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 50,
                imagesize: 200,
                include: 'image',
                boost: 'popularity_total',
                orderby: 'popularity_total'
            }
        });

        if (!response.data || !response.data.results) {
            console.error('Invalid response:', response.data);
            return [];
        }

        // Map the response to include artist images
        const artists = response.data.results.map(artist => ({
            id: artist.id,
            name: artist.name,
            image: artist.image || 'assets/person.jpg',
            joindate: artist.joindate,
            website: artist.website || null,
            shorturl: artist.shorturl || null,
            shareurl: artist.shareurl || null
        }));

        // Remove duplicates based on artist ID
        const uniqueArtists = Array.from(new Map(artists.map(item => [item.id, item])).values());
        console.log(`Total unique artists fetched: ${uniqueArtists.length}`);
        
        return uniqueArtists;

    } catch (error) {
        console.error('Error fetching artists:', error.message);
        if (error.response) {
            console.error('API Response Error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        }
        throw error;
    }
}

// Route to get artists
app.get('/artists', async (req, res) => {
    try {
        const artists = await fetchArtists();
        if (artists && artists.length > 0) {
            res.json(artists);
        } else {
            console.log('No artists found in the response');
            res.status(404).json({ 
                message: 'No artists found',
                clientId: JAMENDO_CLIENT_ID
            });
        }
    } catch (error) {
        console.error('Error in /artists endpoint:', error.message);
        res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message,
            clientId: JAMENDO_CLIENT_ID
        });
    }
});

// Route to search artists
app.get('/search', async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {
        const response = await axios.get(`${JAMENDO_API_URL}/artists/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 10,
                name: query,
                imagesize: 200
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error searching artists:', error);
        res.status(500).json({ 
            message: 'Error searching artists',
            error: error.response?.data || error.message 
        });
    }
});

// Route to save favorite artists
app.post('/favartists', async (req, res) => {
    try {
        const { artists } = req.body;
        
        if (!artists || !Array.isArray(artists)) {
            return res.status(400).json({ message: 'Invalid artists data' });
        }

        // For now, using a temporary userId. Later, this should come from authentication
        const tempUserId = 'temp-user-id';

        // Check if user already has favorite artists
        let userFavArtists = await FavArtist.findOne({ userId: tempUserId });

        if (userFavArtists) {
            // Update existing favorites
            userFavArtists.artists = artists;
            await userFavArtists.save();
        } else {
            // Create new favorites document
            userFavArtists = new FavArtist({
                userId: tempUserId,
                artists: artists
            });
            await userFavArtists.save();
        }

        res.status(201).json({
            message: 'Favorite artists saved successfully',
            data: userFavArtists
        });

    } catch (error) {
        console.error('Error saving favorite artists:', error);
        res.status(500).json({
            message: 'Error saving favorite artists',
            error: error.message
        });
    }
});

// Route to get favorite artists
app.get('/favartists/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userFavArtists = await FavArtist.findOne({ userId });

        if (!userFavArtists) {
            return res.status(404).json({ message: 'No favorite artists found' });
        }

        res.json(userFavArtists.artists);
    } catch (error) {
        console.error('Error fetching favorite artists:', error);
        res.status(500).json({
            message: 'Error fetching favorite artists',
            error: error.message
        });
    }
});

// Get list of artists to discover (excluding user's favorite)
app.get('/artists/discover', async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/artists`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 10,
                orderby: 'joindate_desc' // Get newest artists
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error discovering artists:', error);
        res.status(500).json({ message: 'Error discovering artists' });
    }
});

// Get favorite artist's albums
app.get('/artists/favorite/:userId/albums', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get user's favorite artist from database
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has favorite artists or music style
        if (!user.favArtists?.length && !user.musicStyle) {
            return res.status(404).json({ message: 'No favorite artists or music style found' });
        }

        let artistId;
        let artistName;

        // First try to get a random favorite artist
        if (user.favArtists?.length > 0) {
            const randomArtist = user.favArtists[Math.floor(Math.random() * user.favArtists.length)];
            artistId = randomArtist.artistId;
            artistName = randomArtist.name;
        }

        // Get albums based on artist ID or music style
        const response = await axios.get(`${JAMENDO_API_URL}/albums`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 8,
                ...(artistId ? { artist_id: artistId } : { tags: user.musicStyle })
            }
        });

        // Add artist name to response if we have it
        if (artistName) {
            response.data.results = response.data.results.map(album => ({
                ...album,
                artist_name: artistName
            }));
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching favorite artist albums:', error);
        res.status(500).json({ message: 'Error fetching favorite artist albums' });
    }
});

// Get artist details
app.get('/artists/:artistId', async (req, res) => {
    try {
        const { artistId } = req.params;
        const response = await axios.get(`${JAMENDO_API_URL}/artists`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                id: artistId
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching artist details:', error);
        res.status(500).json({ message: 'Error fetching artist details' });
    }
});

// Start the server
app.listen(port, () => {
    if (!JAMENDO_CLIENT_ID) {
        console.error('WARNING: JAMENDO_CLIENT_ID is not set in .env file');
    }
    console.log(`Artist service listening at http://localhost:${port}`);
});
