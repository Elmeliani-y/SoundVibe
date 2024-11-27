const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT4;

const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).send('Query parameter "q" is required');
    }

    try {
        const [tracksResponse, artistsResponse, albumsResponse] = await Promise.all([
            axios.get(`${JAMENDO_API_URL}/tracks`, {
                params: {
                    client_id: JAMENDO_CLIENT_ID,
                    format: 'json',
                    limit: 10,
                    search: query
                }
            }),
            axios.get(`${JAMENDO_API_URL}/artists`, {
                params: {
                    client_id: JAMENDO_CLIENT_ID,
                    format: 'json',
                    limit: 10,
                    search: query
                }
            }),
            axios.get(`${JAMENDO_API_URL}/albums`, {
                params: {
                    client_id: JAMENDO_CLIENT_ID,
                    format: 'json',
                    limit: 10,
                    search: query
                }
            })
        ]);

        res.json({
            tracks: tracksResponse.data.results,
            artists: artistsResponse.data.results,
            albums: albumsResponse.data.results
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching data from Jamendo API');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});