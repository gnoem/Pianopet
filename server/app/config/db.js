const mongoose = require('mongoose');

const auth = process.env.MONGO_AUTH || require('./vars').MONGO_AUTH;

module.exports = async () => {
    mongoose.connect(`mongodb+srv://admin:${auth}@cluster0.nxvhj.mongodb.net/pianopet?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error', err));
}