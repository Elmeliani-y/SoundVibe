const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load .env from the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());

// Environment variables
const PORT = process.env.PORT5 || 3004;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/soundvibe';
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

console.log('MongoDB URL:', MONGODB_URL);
console.log('Jamendo Client ID:', JAMENDO_CLIENT_ID);

// Get the User model
const UserModel = require('../User/connect');

// MongoDB Connection
mongoose.connect(MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

app.use(express.json());

app.get('/albums', async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/albums/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json'
            }
        });
        console.log('Jamendo API response:', response.data);
        res.json(response.data.results);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            message: 'Error fetching albums from Jamendo',
            error: error.message 
        });
    }
});

app.get('/albums/:id', async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/albums/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                id: req.params.id,
                format: 'json'
            }
        });
        console.log('Jamendo API response:', response.data);
        if (response.data.results.length === 0) return res.status(404).send('Album not found');
        res.json(response.data.results[0]);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            message: 'Error fetching album from Jamendo',
            error: error.message 
        });
    }
});

app.get('/albums/artist/:name', async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/albums/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                artist_name: req.params.name,
                format: 'json'
            }
        });
        console.log('Jamendo API response:', response.data);
        res.json(response.data.results);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            message: 'Error fetching albums from Jamendo',
            error: error.message 
        });
    }
});

app.get('/albums/search/:keyword', async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/albums/`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                name: req.params.keyword,
                format: 'json'
            }
        });
        console.log('Jamendo API response:', response.data);
        res.json(response.data.results);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            message: 'Error searching albums on Jamendo',
            error: error.message 
        });
    }
});

app.get('/albums/favorite/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching albums for user:', userId);
        
        // Get user from database
        const user = await UserModel.findById(userId);
        console.log('Found user:', JSON.stringify(user, null, 2));

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has favorite artists
        if (!user.favArtists || user.favArtists.length === 0) {
            return res.status(404).json({ message: 'No favorite artists found' });
        }

        console.log('Favorite artists:', JSON.stringify(user.favArtists, null, 2));

        // Fetch albums for each favorite artist
        const allAlbums = await Promise.all(user.favArtists.map(async (artist) => {
            try {
                console.log(`Fetching albums for artist: ${JSON.stringify(artist, null, 2)}`);
                
                const response = await axios.get(`${JAMENDO_API_URL}/albums`, {
                    params: {
                        client_id: JAMENDO_CLIENT_ID,
                        format: 'json',
                        limit: 5, // Limit per artist
                        artist_id: artist.artistId
                    }
                });

                console.log(`Albums response for ${artist.name}:`, JSON.stringify(response.data, null, 2));

                // Add artist info to each album
                const albums = response.data.results.map(album => ({
                    ...album,
                    artist_name: artist.name,
                    artist_id: artist.artistId,
                    image: album.image || 'assets/default-album.png'
                }));

                return {
                    artist: {
                        id: artist.artistId,
                        name: artist.name,
                        image: artist.image
                    },
                    albums: albums
                };
            } catch (error) {
                console.error(`Error fetching albums for artist ${artist.name}:`, error);
                return {
                    artist: {
                        id: artist.artistId,
                        name: artist.name,
                        image: artist.image
                    },
                    albums: []
                };
            }
        }));

        // Filter out artists with no albums
        const albumsByArtist = allAlbums.filter(item => item.albums.length > 0);
        
        console.log('Final response:', JSON.stringify({ results: albumsByArtist }, null, 2));

        res.json({ results: albumsByArtist });
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            message: 'Error fetching favorite artists albums',
            error: error.message 
        });
    }
});

app.get('/albums/popular', async (req, res) => {
    try {
        const response = await axios.get(`${JAMENDO_API_URL}/albums`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 10,
                orderby: 'popularity_total'
            }
        });
        console.log('Jamendo API response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            message: 'Error fetching popular albums',
            error: error.message 
        });
    }
});

app.get('/albums/:albumId', async (req, res) => {
    try {
        const { albumId } = req.params;
        const response = await axios.get(`${JAMENDO_API_URL}/albums`, {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                id: albumId
            }
        });
        console.log('Jamendo API response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            message: 'Error fetching album details',
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Albums Service is running on port ${PORT}`);
});
