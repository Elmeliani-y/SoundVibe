const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const dotenv = require('dotenv');
const userModel = require('./connect');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyJWT = require('./middlewear/index');

dotenv.config();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: true,
    })
);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
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

// Sign-up endpoint
app.post('/sign-up', async (req, res) => {
  try {
    const { name, lastname, email, password, musicStyle } = req.body;
    console.log('Signup attempt for:', { email, name, lastname, hasPassword: !!password });

    if (!email || !password || !name || !lastname) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user - password will be hashed by the schema pre-save hook
    const user = new userModel({
      name,
      lastname,
      email,
      password, // Schema will hash this
      musicStyle: musicStyle || '',
      profilePicture: null
    });

    // Save user to database
    await user.save();
    console.log('User saved successfully:', {
      userId: user._id,
      email: user.email,
      name: user.name
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Send response
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastname: user.lastname,
        musicStyle: user.musicStyle,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt received:', { email, hasPassword: !!password });

    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found, comparing passwords');
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Password valid, generating token');
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', {
      email: user.email,
      userId: user._id,
      tokenGenerated: !!token
    });

    res.json({ 
      token, 
      user: { 
        id: user._id,
        name: user.name,
        email: user.email,
        lastname: user.lastname,
        musicStyle: user.musicStyle,
        profilePicture: user.profilePicture,
        favArtists: user.favArtists
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in',
      error: error.message 
    });
  }
});

// Get user profile
app.get('/profile', verifyJWT, async (req, res) => {
  try {
    console.log('Getting user profile for ID:', req.user.id);
    const user = await userModel.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert relative paths to full URLs for profile picture
    if (user.profilePicture && !user.profilePicture.startsWith('http')) {
      if (user.profilePicture.startsWith('/uploads/')) {
        user.profilePicture = `${BASE_URL}${user.profilePicture}`;
      }
    }

    console.log('Sending user profile:', user);
    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Error getting user profile' });
  }
});

// Update user profile
app.put('/update', verifyJWT, upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('Updating user profile...');
    const userId = req.user.id;
    const updates = req.body;
    console.log('Update request body:', updates);
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle password update
    if (updates.currentPassword) {
      const validPassword = await bcrypt.compare(updates.currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      if (updates.newPassword) {
        updates.password = await bcrypt.hash(updates.newPassword, 10);
      }
    }

    // Handle profile picture upload
    if (req.file) {
      console.log('Processing new profile picture:', req.file.filename);
      
      // Delete old profile picture if it exists and is not the default
      if (user.profilePicture && !user.profilePicture.includes('default-profile.png')) {
        try {
          let oldPicturePath;
          if (user.profilePicture.startsWith('http')) {
            const filename = user.profilePicture.split('/').pop();
            oldPicturePath = path.join(__dirname, 'uploads', filename);
          } else if (user.profilePicture.startsWith('/uploads/')) {
            oldPicturePath = path.join(__dirname, user.profilePicture.slice(1));
          } else {
            oldPicturePath = path.join(__dirname, 'uploads', user.profilePicture);
          }
          
          console.log('Attempting to delete old profile picture:', oldPicturePath);
          if (fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
            console.log('Successfully deleted old profile picture');
          }
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
        }
      }
      
      // Set the new profile picture path
      updates.profilePicture = `/uploads/${req.file.filename}`;
      console.log('New profile picture path:', updates.profilePicture);
    }

    // Remove password fields from updates
    delete updates.currentPassword;
    delete updates.newPassword;
    delete updates.confirmNewPassword;

    console.log('Final updates to apply:', updates);

    // Update the user
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, select: '-password' }
    );

    // Convert relative paths to full URLs for profile picture
    if (updatedUser.profilePicture && !updatedUser.profilePicture.startsWith('http')) {
      if (updatedUser.profilePicture.startsWith('/uploads/')) {
        updatedUser.profilePicture = `${BASE_URL}${updatedUser.profilePicture}`;
        console.log('Full profile picture URL:', updatedUser.profilePicture);
      }
    }

    console.log('User updated successfully:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Add artist to favorites
app.post('/artists/:id/favorite', verifyJWT, async (req, res) => {
  try {
    const artistId = req.params.id;
    const userId = req.user.id;
    const { name, image } = req.body; // Get artist details from request body

    console.log(`Adding artist ${artistId} to favorites for user ${userId}`);

    // Find the user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if artist is already in favorites
    if (user.favArtists.some(artist => artist.artistId === artistId)) {
      console.log('Artist already in favorites:', artistId);
      return res.status(400).json({ message: 'Artist already in favorites' });
    }

    // Add artist to favorites array with full details
    user.favArtists.push({
      artistId,
      name,
      image,
      addedAt: new Date()
    });
    
    // Save the updated user document
    await user.save();
    console.log('Successfully added artist to favorites:', {
      userId: user._id,
      artistId: artistId,
      artistName: name,
      totalFavorites: user.favArtists.length
    });

    res.json({ 
      message: 'Artist added to favorites', 
      favArtists: user.favArtists,
      userId: user._id
    });
  } catch (error) {
    console.error('Error adding artist to favorites:', error);
    res.status(500).json({ 
      message: 'Error adding artist to favorites',
      error: error.message 
    });
  }
});

// Remove artist from favorites
app.post('/artists/:id/unfavorite', verifyJWT, async (req, res) => {
  try {
    const artistId = req.params.id;
    const userId = req.user.id;

    console.log(`Removing artist ${artistId} from favorites for user ${userId}`);

    // Find the user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if artist is in favorites
    const initialLength = user.favArtists.length;
    user.favArtists = user.favArtists.filter(artist => artist.artistId !== artistId);
    
    if (user.favArtists.length === initialLength) {
      console.log('Artist not in favorites:', artistId);
      return res.status(400).json({ message: 'Artist not in favorites' });
    }

    // Save the updated user document
    await user.save();
    console.log('Successfully removed artist from favorites:', {
      userId: user._id,
      artistId: artistId,
      totalFavorites: user.favArtists.length
    });

    res.json({ 
      message: 'Artist removed from favorites', 
      favArtists: user.favArtists,
      userId: user._id
    });
  } catch (error) {
    console.error('Error removing artist from favorites:', error);
    res.status(500).json({ 
      message: 'Error removing artist from favorites',
      error: error.message 
    });
  }
});

// Get favorite artists for current user
app.get('/artists/favorites', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching favorite artists for user:', userId);

    // Find the user and populate their favorite artists
    const user = await userModel.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found favorite artists:', {
      userId: user._id,
      totalFavorites: user.favArtists.length,
      artists: user.favArtists
    });

    res.json({ 
      favArtists: user.favArtists,
      userId: user._id
    });
  } catch (error) {
    console.error('Error fetching favorite artists:', error);
    res.status(500).json({ 
      message: 'Error fetching favorite artists',
      error: error.message 
    });
  }
});

// User Logout Route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'User logged out successfully' });
    });
});

// Like and Unlike Playlist Routes
app.post(`/playlists/:playlistid/like`, verifyJWT, async (req, res) => {
    const { playlistid } = req.params;
    try {
        const user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.likedPlaylists.includes(playlistid)) {
            user.likedPlaylists.push(playlistid);
            await user.save();
        }
        res.json({ message: 'Playlist liked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post(`/playlists/:playlistid/unlike`, verifyJWT, async (req, res) => {
    const { playlistid } = req.params;
    try {
        const user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.likedPlaylists.includes(playlistid)) {
            user.likedPlaylists = user.likedPlaylists.filter(id => id !== playlistid);
            await user.save();
        }
        res.json({ message: 'Playlist unliked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add track to favorites
app.post('/users/favorites/tracks', verifyJWT, async (req, res) => {
  try {
    const { trackId, name, artist, image } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if track already exists in favorites
    const trackExists = user.favoriteTracks.some(track => track.trackId === trackId);
    if (!trackExists) {
      user.favoriteTracks.push({
        trackId,
        name,
        artist,
        image,
        addedAt: new Date()
      });
      await user.save();
    }

    res.json({ success: true, favorites: user.favoriteTracks });
  } catch (error) {
    console.error('Error adding track to favorites:', error);
    res.status(500).json({ message: 'Error adding track to favorites' });
  }
});

// Remove track from favorites
app.delete('/users/favorites/tracks/:trackId', verifyJWT, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favoriteTracks = user.favoriteTracks.filter(track => track.trackId !== trackId);
    await user.save();

    res.json({ success: true, favorites: user.favoriteTracks });
  } catch (error) {
    console.error('Error removing track from favorites:', error);
    res.status(500).json({ message: 'Error removing track from favorites' });
  }
});

// Check if track is in favorites
app.get('/users/favorites/tracks/:trackId', verifyJWT, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isInFavorites = user.favoriteTracks.some(track => track.trackId === trackId);
    res.json({ isInFavorites });
  } catch (error) {
    console.error('Error checking favorite track:', error);
    res.status(500).json({ message: 'Error checking favorite track' });
  }
});

// Get all favorite tracks
app.get('/users/favorites/tracks', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.favoriteTracks);
  } catch (error) {
    console.error('Error fetching favorite tracks:', error);
    res.status(500).json({ message: 'Error fetching favorite tracks' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
