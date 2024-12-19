
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT3 || 3001;

app.use(express.json());

const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0/artists';
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

app.get('/artists', async (req, res) => {
  try {
    // Get all artists from Jamendo API (pagination might be necessary)
    const response = await axios.get(JAMENDO_API_URL, {
      params: { client_id: JAMENDO_CLIENT_ID }
    });
    const artists = response.data.results;

    // Sending back the artist data
    res.json(artists.map(artist => ({
      name: artist.name,
      imageUrl: artist.image[2].url, // Get the image URL from Jamendo API
    })));
  } catch (error) {
    console.error('Error fetching artists', error);
    res.status(500).send('Error fetching artists');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});