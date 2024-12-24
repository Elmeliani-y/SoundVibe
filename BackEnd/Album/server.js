require('dotenv').config();
const express = require('express');

const cors = require('cors');

const axios = require('axios');

const app = express();



// Middleware

app.use(cors());

app.use(express.json());



// Constants

const PORT = process.env.PORT || 3004;

const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';

const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;



// Verify environment variables

if (!JAMENDO_CLIENT_ID) {

    console.error('JAMENDO_CLIENT_ID is not set in environment variables');

    process.exit(1);

}



// Function to fetch albums

async function fetchAlbums(limit = 8) {

    try {

        console.log(`Fetching ${limit} albums...`);

        // Fetch main albums

        const mainResponse = await axios.get(`${JAMENDO_API_URL}/albums/`, {

            params: {

                client_id: process.env.JAMENDO_CLIENT_ID,

                format: 'json',

                limit: limit - 2, // Fetch 2 less than requested

                tags: 'pop'

            }

        });



        // Fetch 2 rock albums for variety

        const rockResponse = await axios.get(`${JAMENDO_API_URL}/albums/`, {

            params: {

                client_id: process.env.JAMENDO_CLIENT_ID,

                format: 'json',

                limit: 2,

                tags: 'rock'

            }

        });



        if (mainResponse.data.results && rockResponse.data.results) {

            // Combine the results

            const albums = [

                ...mainResponse.data.results,

                ...rockResponse.data.results

            ];



            // Map the albums to our format

            return albums.map(album => ({

                id: album.id,

                name: album.name,

                artist_name: album.artist_name,

                image: album.image,

                releasedate: album.releasedate,

                zip: album.zip,

                shorturl: album.shorturl,

                shareurl: album.shareurl

            }));

        }

        

        console.log('No albums found');

        return [];

    } catch (error) {

        console.error('Error fetching albums:', error.message);

        throw error;

    }

}



// Function to fetch album by ID

async function fetchAlbumById(albumId) {

    try {

        console.log(`Making request to Jamendo API for album ${albumId}`);

        const response = await axios.get(`${JAMENDO_API_URL}/albums/`, {

            params: {

                client_id: JAMENDO_CLIENT_ID,

                format: 'json',

                id: albumId

            }

        });



        console.log('Jamendo API response:', {

            status: response.status,

            headers: response.headers,

            data: response.data

        });



        if (!response.data || !response.data.results || !response.data.results[0]) {

            console.log('No album found in Jamendo response');

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

        console.error('Error in fetchAlbumById:', {

            albumId,

            error: error.message,

            response: error.response?.data

        });

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



// Function to fetch albums by genre

async function fetchAlbumsByGenre(genre = 'all', limit = 8) {

    try {

        console.log(`Fetching ${limit} albums for genre: ${genre}`);

        const params = {

            client_id: JAMENDO_CLIENT_ID,

            format: 'json',

            limit: limit,

            include: 'musicinfo',

            imagesize: 200,

            boost: 'popularity_total',

            orderby: 'popularity_total'

        };



        // Add tags parameter only if a specific genre is requested

        if (genre !== 'all') {

            params.tags = genre;

        }



        const response = await axios.get(`${JAMENDO_API_URL}/albums/`, { params });



        if (response.data && response.data.results) {

            return response.data.results.map(album => ({

                id: album.id,

                name: album.name,

                artist_name: album.artist_name,

                image: album.image,

                genre: genre === 'all' ? 'Various' : genre,

                tracks: album.tracks || [],

                releasedate: album.releasedate

            }));

        }

        

        console.log('No albums found for genre:', genre);

        return [];

    } catch (error) {

        console.error('Error fetching albums:', error.message);

        throw error;

    }

}



// Available genres endpoint

app.get('/genres', (req, res) => {

    const genres = [

        'all',

        'pop',

        'rock',

        'jazz',

        'hip-hop',

        'electronic',

        'classical',

        'ambient',

        'folk',

        'indie'

    ];

    res.json(genres);

});



// Route to get all albums

app.get('/albums', async (req, res) => {

    try {

        const limit = parseInt(req.query.limit) || 8;

        const albums = await fetchAlbums(limit);

        

        if (albums && albums.length > 0) {

            res.json(albums);

        } else {

            res.status(404).json({ 

                message: 'No albums found'

            });

        }

    } catch (error) {

        console.error('Error in /albums endpoint:', error);

        res.status(500).json({ 

            message: 'Failed to fetch albums',

            error: error.message 

        });

    }

});



// Test route to verify server is running

app.get('/test', (req, res) => {

    res.json({ message: 'Album service is running' });

});



// Route to get album by ID

app.get('/albums/id/:id', async (req, res) => {

    try {

        const albumId = req.params.id;

        console.log('Received request for album ID:', albumId);



        if (!albumId) {

            return res.status(400).json({ message: 'Album ID is required' });

        }



        // Verify Jamendo API key

        if (!process.env.JAMENDO_CLIENT_ID) {

            console.error('JAMENDO_CLIENT_ID is not set');

            return res.status(500).json({ message: 'Server configuration error' });

        }



        // Fetch album details

        console.log('Fetching album details from Jamendo API...');

        const album = await fetchAlbumById(albumId);

        

        if (!album) {

            console.log('Album not found:', albumId);

            return res.status(404).json({ message: 'Album not found' });

        }

        

        console.log('Album details fetched successfully:', album.name);

        

        // Fetch tracks for the album

        console.log('Fetching tracks for album:', albumId);

        try {

            const tracksResponse = await axios.get(`${JAMENDO_API_URL}/tracks/`, {

                params: {

                    client_id: JAMENDO_CLIENT_ID,

                    format: 'json',

                    album_id: albumId

                }

            });



            if (tracksResponse.data && tracksResponse.data.results) {

                console.log(`Found ${tracksResponse.data.results.length} tracks for album:`, album.name);

                album.tracks = tracksResponse.data.results.map(track => ({

                    id: track.id,

                    name: track.name,

                    duration: track.duration,

                    artist_name: track.artist_name,

                    position: track.position,

                    audio: track.audio

                }));

            } else {

                console.log('No tracks found for album:', album.name);

                album.tracks = [];

            }

        } catch (trackError) {

            console.error('Error fetching tracks:', trackError);

            // Don't fail the whole request if tracks fail to load

            album.tracks = [];

        }



        console.log('Sending complete album response');

        res.json(album);

    } catch (error) {

        console.error('Error details:', {

            message: error.message,

            stack: error.stack,

            response: error.response?.data

        });

        

        if (error.message === 'Album not found') {

            res.status(404).json({ message: 'Album not found' });

        } else {

            res.status(500).json({ 

                message: 'Internal Server Error',

                error: error.message,

                details: error.response?.data

            });

        }

    }

});



// Route to get albums by genre

app.get('/albums/:genre', async (req, res) => {

    try {

        const genre = req.params.genre || 'all';

        const limit = parseInt(req.query.limit) || 8;

        

        console.log(`Fetching albums for genre: ${genre}`);

        const albums = await fetchAlbumsByGenre(genre, limit);

        

        if (albums && albums.length > 0) {

            res.json(albums);

        } else {

            res.status(404).json({ 

                message: `No albums found for genre: ${genre}` 

            });

        }

    } catch (error) {

        console.error('Error in /albums route:', error);

        res.status(500).json({ 

            message: 'Internal server error',

            error: error.message 

        });

    }

});



// Route to get all albums

app.get('/all-albums', async (req, res) => {

    try {

        const limit = parseInt(req.query.limit) || 8;

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



// Route to search albums

app.get('/search', async (req, res) => {

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



// Start server

app.listen(PORT, () => {

    console.log(`Album service running on port ${PORT}`);

});

