const express = require('express');
require('dotenv').config();
const axios = require('axios');

const app = express();
const port = process.env.PORT3;

app.use(express.json());

const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0/artists';
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;
const user = `http://localhost:3000/users/${sessionStorage.getItem('userId')}`;

app.get('/artists/:name', async (req, res) => {
    const artistName = req.params.name;
    try {
        const existingArtist = favoriteArtists.find(a => a.id === artistName);
        if (existingArtist) {
            res.json(existingArtist);
            return;
        }
        const response = await axios.get(JAMENDO_API_URL, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                name: artistName
            }
        });
        const artists = response.data.results;
        if (artists.length > 0) {
            res.json(artists[0]);
        } else {
            res.status(404).send('Artist not found');
        }
    } catch (error) {
        res.status(500).send('Error fetching artist from Jamendo API');
    }
});

app.post(`/artist/addFavorite/:artistid`, async (req, res) => {
    const artistId = req.params.artistid;
    try {  
        const response = await axios.post(`${user}/artists/${artistId}/favorite`);
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(500).send('Error adding artist to favorites');
    }
});
const userService = {
    getUserFavorites: (userId) => {
        return favoriteArtists.filter(artist => artist.userId === userId);
    },
    addUserFavorite: (userId, artist) => {
        if (!favoriteArtists.find(a => a.id === artist.id && a.userId === userId)) {
            favoriteArtists.push({ ...artist, userId });
        }
    }
};

app.get('/users/:userId/artists/favorite', (req, res) => {
    const userId = req.params.userId;
    const userFavorites = userService.getUserFavorites(userId);
    res.json(userFavorites);
});

app.post('/users/:userId/artists/favorite', (req, res) => {
    const userId = req.params.userId;
    const artist = req.body;
    if (artist && artist.id) {
        userService.addUserFavorite(userId, artist);
        res.status(201).send('Artist added to user favorites');
    } else {
        res.status(400).send('Invalid artist data');
    }
});
app.post('/users/:userId/artists/:artistId/favorite', async (req, res) => {
    const userId = req.params.userId;
    const artistId = req.params.artistId;
    try {
        const response = await axios.get(JAMENDO_API_URL, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                id: artistId
            }
        });
        const artists = response.data.results;
        if (artists.length > 0) {
            const artist = artists[0];
            userService.addUserFavorite(userId, artist);
            res.status(201).send('Artist added to user favorites');
        } else {
            res.status(404).send('Artist not found');
        }
    } catch (error) {
        res.status(500).send('Error fetching artist from Jamendo API');
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
}); 