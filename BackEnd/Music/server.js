const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const axios = require('axios');
const verifyJWT = require("../User/middlewear/index");

const cors = require('cors');


dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT2 || 3001;
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';

app.use(express.json());
app.get('/music/all', async (req, res) => {
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
app.get('/music/search/{name}', async (req, res) => {
    const { name } = req.params;
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/tracks`, {
            params: {
                client_id: process.env.JAMENDO_CLIENT_ID,
                format: 'json',
                name : name
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
