const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Badge = mongoose.model(
    'Badge',
    new Schema({
        badgeID: String,
        badgeName: String,
        badgeDescription: String,
        badgeImage: String,
        badgeValue: Number
    }),
    'badges'
);

module.exports = Badge;