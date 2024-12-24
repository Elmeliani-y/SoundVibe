require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soundvibe', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized Access'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// Import and use routes
const musicRoutes = require('./Music/routes');
const userRoutes = require('./User/routes');
const playlistRoutes = require('./Playlist/routes');
const searchRoutes = require('./Search/routes');
const artistRoutes = require('./Artist/routes');
const albumRoutes = require('./Albums/routes');

app.use('/music', musicRoutes);
app.use('/user', userRoutes);
app.use('/playlist', playlistRoutes);
app.use('/search', searchRoutes);
app.use('/artist', artistRoutes);
app.use('/albums', albumRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
