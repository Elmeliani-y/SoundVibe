const express = require('express');
require('dotenv').config();
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT4 || 3003;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/SoundVibe', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

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

// Start the server
app.listen(port, () => {
    if (!JAMENDO_CLIENT_ID) {
        console.error('WARNING: JAMENDO_CLIENT_ID is not set in .env file');
    }
    console.log(`Artist service listening at http://localhost:${port}`);
});
