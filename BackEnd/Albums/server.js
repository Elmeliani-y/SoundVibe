const express = require('express');
const axios = require('axios');

const app = express();
require('dotenv').config();
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0/albums';
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

app.use(express.json());

app.get('/albums', async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json'
            }
        });
        res.json(response.data.results);
    } catch (error) {
        res.status(500).send('Error fetching albums from Jamendo');
    }
});

app.get('/albums/:id', async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                id: req.params.id,
                format: 'json'
            }
        });
        if (response.data.results.length === 0) return res.status(404).send('Album not found');
        res.json(response.data.results[0]);
    } catch (error) {
        res.status(500).send('Error fetching album from Jamendo');
    }
});

app.get('/albums/artist/:name', async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                artist_name: req.params.name,
                format: 'json'
            }
        });
        res.json(response.data.results);
    } catch (error) {
        res.status(500).send('Error fetching albums from Jamendo');
    }
});

app.get('/albums/search/:keyword', async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                name: req.params.keyword,
                format: 'json'
            }
        });
        res.json(response.data.results);
    } catch (error) {
        res.status(500).send('Error searching albums on Jamendo');
    }
});
