const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Wearable = mongoose.model(
    'Wearable',
    new Schema({
        teacherCode: String,
        name: String,
        category: String,
        value: Number,
        src: String
    }),
    'wearables'
);

module.exports = Wearable;