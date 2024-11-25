const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const dotenv = require('dotenv');
const multer = require('multer');
const userModel = require('../User/connect');
const verifyJWT = require('../User/middlewear/index');

dotenv.config();
const app = express();

app.use(express.json());
app.use(
    session({
        secret: process.env.SECRET_KEY, 
        resave: false,
        saveUninitialized: true,
    })
);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/signup', upload.single('profilePic'), async (req, res) => {
    const { name, username, email, password, musicStyle } = req.body;
    const profilePic = req.file ? req.file.buffer : null;

    if (!name || !username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required: name, username, email, password' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            username,
            email,
            password: hashedPassword,
            profilePic, // Add profilePic to the user object
            musicStyle  // Add musicStyle to the user object
        });

        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: '30d' }
        );

        req.session.user = {
            name: user.name,
            email: user.email,
            genre: user.genre,
            token: token
        };

        res.json({ message: 'User authenticated successfully' , token: token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/profile', verifyJWT, (req, res) => {
    res.json({ 
        message: 'Welcome to your profile', 
        user: {
            name: req.user.name,
            email: req.user.email,
            profilePic: req.user.profilePic, // Include profilePic in the response
            musicStyle: req.user.musicStyle  // Include musicStyle in the response
        }
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'User logged out successfully' });
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.PORT}`);
});