const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your-secret-key'; // Make sure this matches the key used to sign the token

const verifyJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        console.log('Token verified successfully:', verified);
        req.user = verified;
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = verifyJWT;
