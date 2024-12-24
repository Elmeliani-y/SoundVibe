const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Playlist = require('./connect');

const app = express();
const PORT = 3002;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Enable CORS
app.use(cors());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to convert image path to full URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) {
    return `${BASE_URL}${imagePath}`;
  }
  return `${BASE_URL}/uploads/${imagePath}`;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'playlist-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'));
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(express.json());

// Get all playlists
app.get('/playlists-Api', async (req, res) => {
  try {
    const playlists = await Playlist.find();
    
    // Convert relative paths to full URLs for images
    const playlistsWithUrls = playlists.map(playlist => {
      const playlistObj = playlist.toObject();
      if (playlistObj.image) {
        playlistObj.image = getFullImageUrl(playlistObj.image);
      }
      return playlistObj;
    });
    
    res.json(playlistsWithUrls);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new playlist
app.post('/playlists-Api', upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const playlist = new Playlist({
      name,
      description,
      image: imagePath,
      tracks: [],
      owner: 'user', // You can update this with actual user ID from authentication
      collaborators: []
    });

    await playlist.save();

    // Convert image path to full URL in response
    const playlistObj = playlist.toObject();
    if (playlistObj.image) {
      playlistObj.image = getFullImageUrl(playlistObj.image);
    }

    res.status(201).json(playlistObj);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Playlist microservice is running on port ${PORT}`);
});
