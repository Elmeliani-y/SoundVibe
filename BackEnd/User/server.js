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
const crypto = require('crypto');
const nodemailer = require('nodemailer');

dotenv.config();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const app = express();
app.use(express.json());

app.use(cors({
}));

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

// Middleware to verify JWT token
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  
  if (!authHeader) {
    console.log('No authorization header');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token in auth header');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log('Token verified:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Create email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Sign-up endpoint
app.post('/sign-up', async (req, res) => {
  try {
    console.log('\n=== New Signup Request ===');
    console.log('Request body:', req.body);
    const { name, lastname, email, password, musicStyle } = req.body;

    // Validate required fields
    if (!name || !lastname || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'All fields are required: name, lastname, email, password' 
      });
    }

    // Check if user already exists
    console.log('Checking if user exists with email:', email);
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    console.log('No existing user found, proceeding with signup');

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create new user
    console.log('Creating new user document...');
    const user = new userModel({
      name,
      lastname,
      email,
      password: hashedPassword,
      musicStyle: musicStyle || '',
      profilePicture: null,
      favArtists: []
    });

    // Save user to database
    console.log('Attempting to save user to database...');
    try {
      const savedUser = await user.save();
      console.log('User saved successfully. Document:', {
        id: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,
        lastname: savedUser.lastname
      });
    } catch (saveError) {
      console.error('Error saving user to database:', saveError);
      throw saveError;
    }

    // Generate token
    console.log('Generating JWT token...');
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
    );
    console.log('Token generated successfully');

    // Send response
    console.log('Sending success response...');
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
    console.log('=== Signup Complete ===\n');
  } catch (error) {
    console.error('\n=== Signup Error ===');
    console.error('Error details:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
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
    console.log('Login attempt for email:', email);

    const user = await userModel.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
    );

    console.log('Login successful, token generated');
    res.json({ token, user: { 
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture
    }});
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
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

// Forgot Password endpoint
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('Searching for user with email:', email);
    
    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found, generating reset token');

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // Token expires in 1 hour
    
    console.log('Saving user with reset token');
    await user.save();

    // Create reset URL
    const resetUrl = `http://localhost:4200/reset-password?token=${resetToken}`;
    
    console.log('Preparing email');
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request - SoundVibe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #C969E6;">Reset Your Password</h1>
          <p>You requested a password reset for your SoundVibe account.</p>
          <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #C969E6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">This is an automated email from SoundVibe. Please do not reply.</p>
        </div>
      `
    };

    console.log('Sending email');
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    
    res.json({ 
      message: 'Password reset email sent',
      success: true
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Error processing request',
      error: error.message 
    });
  }
});

// Reset Password endpoint
app.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Successful',
      html: `
        <h1>Password Reset Successful</h1>
        <p>Your password has been successfully reset.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
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

// Favorite and Unfavorite Artist Routes
app.post(`/artists/:artistid/favorite`, verifyJWT, async (req, res) => {
    const { artistid } = req.params;
    try {
        console.log('\n=== Adding Artist to Favorites ===');
        console.log('Artist ID:', artistid);
        console.log('User ID from token:', req.user.id);
        console.log('User email from token:', req.user.email);
        
        // First try to find the user
        const user = await userModel.findById(req.user.id);
        console.log('Found user:', user ? {
            id: user._id,
            email: user.email,
            favArtists: user.favArtists
        } : 'No user found');
        
        if (!user) {
            console.log('User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize favArtists if it doesn't exist
        if (!user.favArtists) {
            console.log('Initializing favArtists array');
            user.favArtists = [];
        }

        console.log('Current favorite artists:', user.favArtists);
        
        // Check if artist is not already in favorites
        if (!user.favArtists.includes(artistid)) {
            console.log('Adding new artist to favorites');
            // Add the artist ID to favorites
            user.favArtists.push(artistid);
            console.log('Updated favorite artists:', user.favArtists);
            
            // Mark the field as modified
            user.markModified('favArtists');
            console.log('Marked favArtists as modified');
            
            try {
                // Save the changes
                const savedUser = await user.save();
                console.log('Successfully saved user. Updated document:', {
                    id: savedUser._id,
                    email: savedUser.email,
                    favArtists: savedUser.favArtists
                });
            } catch (saveError) {
                console.error('Error saving user:', saveError);
                throw saveError;
            }
        } else {
            console.log('Artist already in favorites');
        }
        
        res.json({ 
            message: 'Artist added to favorites',
            favArtists: user.favArtists 
        });
    } catch (error) {
        console.error('Error in /favorite endpoint:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        res.status(500).json({ 
            message: error.message,
            stack: error.stack 
        });
    }
});

app.post(`/artists/:artistid/unfavorite`, verifyJWT, async (req, res) => {
    const { artistid } = req.params;
    try {
        console.log('=== Removing Artist from Favorites ===');
        console.log('Artist ID:', artistid);
        console.log('User from token:', req.user);
        
        const user = await userModel.findById(req.user.id);
        console.log('Found user:', user ? 'Yes' : 'No');
        
        if (!user) {
            console.log('User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize favArtists if it doesn't exist
        if (!user.favArtists) {
            console.log('Initializing favArtists array');
            user.favArtists = [];
        }

        console.log('Current favorite artists:', user.favArtists);
        
        // Remove the artist ID from favorites
        const initialLength = user.favArtists.length;
        user.favArtists = user.favArtists.filter(id => id !== artistid);
        console.log('Updated favorite artists:', user.favArtists);
        
        if (user.favArtists.length !== initialLength) {
            // Mark the field as modified
            user.markModified('favArtists');
            console.log('Marked favArtists as modified');
            
            // Save the changes
            await user.save();
            console.log('Successfully saved user');
        } else {
            console.log('Artist was not in favorites');
        }
        
        res.json({ 
            message: 'Artist removed from favorites',
            favArtists: user.favArtists 
        });
    } catch (error) {
        console.error('Error in /unfavorite endpoint:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        res.status(500).json({ 
            message: error.message,
            stack: error.stack 
        });
    }
});

app.get('/favorite-artists', verifyJWT, async (req, res) => {
    try {
        console.log('=== Getting Favorite Artists ===');
        console.log('User from token:', req.user);
        
        const user = await userModel.findById(req.user.id);
        console.log('Found user:', user ? 'Yes' : 'No');
        
        if (!user) {
            console.log('User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User favorite artists:', user.favArtists);
        
        res.json({ 
            favArtists: user.favArtists || [] 
        });
    } catch (error) {
        console.error('Error getting favorite artists:', error);
        res.status(500).json({ message: error.message });
    }
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

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.PORT}`);
});
