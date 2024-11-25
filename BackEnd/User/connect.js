const dotenv = require('dotenv');
dotenv.config(); 

const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL;
console.log(MONGODB_URL);
if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined in .env file");
}

mongoose.connect(MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Failed to connect to MongoDB:", err));

    const UserSchema = new mongoose.Schema({
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    });
    
    const userModel = mongoose.model('User', UserSchema);
    
    module.exports = userModel;
    