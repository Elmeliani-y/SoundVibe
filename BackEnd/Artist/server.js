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

// Function to fetch albums
async function fetchAlbums(limit = 4) {
    try {
        console.log(`Fetching ${limit} albums...`);
        const response = await axios.get(`${JAMENDO_API_URL}/albums/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                limit: limit,
                imagesize: 200,
                include: 'stats',
                boost: 'popularity_total',
                orderby: 'popularity_total'
            }
        });

        if (!response.data || !response.data.results) {
            console.error('Invalid response:', response.data);
            return [];
        }

        // Map the response to include album details
        const albums = response.data.results.map(album => ({
            id: album.id,
            name: album.name,
            artist_name: album.artist_name,
            artist_id: album.artist_id,
            image: album.image || 'assets/default-album.jpg',
            releasedate: album.releasedate,
            zip: album.zip,
            shorturl: album.shorturl,
            shareurl: album.shareurl,
            popularity: album.popularity_total || 0
        }));

        console.log(`Fetched ${albums.length} albums successfully`);
        return albums;

    } catch (error) {
        console.error('Error fetching albums:', error.message);
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

// Function to fetch album by ID
async function fetchAlbumById(albumId) {
    try {
        console.log(`Fetching album with ID: ${albumId}`);
        const response = await axios.get(`${JAMENDO_API_URL}/albums/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                id: albumId
            }
        });

        if (!response.data || !response.data.results || !response.data.results[0]) {
            throw new Error('Album not found');
        }

        const album = response.data.results[0];
        return {
            id: album.id,
            name: album.name,
            artist_name: album.artist_name,
            artist_id: album.artist_id,
            image: album.image || 'assets/default-album.jpg',
            releasedate: album.releasedate,
            zip: album.zip,
            shorturl: album.shorturl,
            shareurl: album.shareurl,
            popularity: album.popularity_total || 0
        };

    } catch (error) {
        console.error(`Error fetching album ${albumId}:`, error.message);
        throw error;
    }
}

// Function to search albums
async function searchAlbums(query) {
    try {
        console.log(`Searching albums with query: ${query}`);
        const response = await axios.get(`${JAMENDO_API_URL}/albums/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                namesearch: query,
                limit: 10
            }
        });

        if (!response.data || !response.data.results) {
            return [];
        }

        return response.data.results.map(album => ({
            id: album.id,
            name: album.name,
            artist_name: album.artist_name,
            artist_id: album.artist_id,
            image: album.image || 'assets/default-album.jpg',
            releasedate: album.releasedate,
            zip: album.zip,
            shorturl: album.shorturl,
            shareurl: album.shareurl,
            popularity: album.popularity_total || 0
        }));

    } catch (error) {
        console.error('Error searching albums:', error.message);
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

// Route to get albums
app.get('/albums', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const albums = await fetchAlbums(limit);
        
        if (albums && albums.length > 0) {
            res.json(albums);
        } else {
            console.log('No albums found in the response');
            res.status(404).json({ 
                message: 'No albums found'
            });
        }
    } catch (error) {
        console.error('Error in /albums endpoint:', error.message);
        res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

// Route to get album by ID
app.get('/albums/:id', async (req, res) => {
    try {
        const albumId = req.params.id;
        const album = await fetchAlbumById(albumId);
        res.json(album);
    } catch (error) {
        console.error('Error in /albums/:id endpoint:', error.message);
        if (error.message === 'Album not found') {
            res.status(404).json({ message: 'Album not found' });
        } else {
            res.status(500).json({ 
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }
});

// Route to search albums
app.get('/albums/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const albums = await searchAlbums(q);
        if (albums.length > 0) {
            res.json(albums);
        } else {
            res.status(404).json({ message: 'No albums found matching your search' });
        }
    } catch (error) {
        console.error('Error in /albums/search endpoint:', error.message);
        res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message
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

// Start the server
app.listen(port, () => {
    if (!JAMENDO_CLIENT_ID) {
        console.error('WARNING: JAMENDO_CLIENT_ID is not set in .env file');
    }
    console.log(`Artist service listening at http://localhost:${port}`);
});
