const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const multer = require('multer');
const axios = require('axios');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';

app.use(express.json());
app.use(
    session({
        secret: process.env.SECRET_KEY, 
        resave: false,
        saveUninitialized: true,
    })
);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/api/search/tracks', async (req, res) => {
    const { query } = req.query;
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/tracks`, {
            params: {
                client_id: process.env.JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 10,
                search: query
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error searching tracks' });
    }
});

app.get('/api/search/artists', async (req, res) => {
    const { query } = req.query;
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/artists`, {
            params: {
                client_id: process.env.JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 10,
                search: query
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error searching artists' });
    }
});
app.get('/api/track/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/tracks`, {
            params: {
                client_id: process.env.JAMENDO_CLIENT_ID,
                format: 'json',
                id: id
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error getting track details' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
