const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/SoundVibe';

mongoose.connect(MONGODB_URL)
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  musicStyle: { type: String, default: '' },
  profilePicture: { type: String, default: null },
  favoriteTracks: [{
    trackId: { type: String, required: true },
    name: { type: String, required: true },
    artist: { type: String, required: true },
    image: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  favArtists: [{
    artistId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  likedPlaylists: [{
    type: String,
    ref: 'Playlist'
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for user's full name
UserSchema.virtual('fullName').get(function() {
  return `${this.name} ${this.lastname}`;
});

const User = mongoose.model('User', UserSchema);

module.exports = User;