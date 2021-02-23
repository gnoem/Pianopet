const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Badge = mongoose.model(
    'Badge',
    new Schema({
        teacherCode: String,
        name: String,
        src: String,
        value: Number,
        awardedTo: [String] // string of student IDs
    }),
    'badges'
);

module.exports = Badge;