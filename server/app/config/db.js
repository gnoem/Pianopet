const mongoose = require('mongoose');
const { MONGO_URI } = require('./');

const uri = process.env.MONGO_URI || MONGO_URI;

module.exports = async () => {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error', err));
}