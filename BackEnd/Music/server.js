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
app.use(cors());
const PORT = 3001;
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = 'a72fb851';

app.use(express.json());

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
                limit: 8,
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

app.listen(PORT, () => {
    console.log(`Music Service is running on port ${PORT}`);
});
