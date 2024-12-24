const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    id: String,
    name: String,
    artist_name: String,
    artist_id: String,
    image: String,
    releasedate: String,
    zip: String,
    shorturl: String,
    shareurl: String,
    popularity: Number
});

const Album = mongoose.model('Album', albumSchema);

module.exports = {
    Album
};
