const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Student = mongoose.model(
    'Student',
    new Schema({
        username: String,
        password: String,
        coins: Number,
        teacher: String, // schematypes.objectID
        avatar: {
            body: String
        },
        closet: String, // going to be object with keys 'eyes', 'hat', etc. that have arrays of strings as values
        badges: [{
            badgeId: String,
            badgeName: String,
            badgeDescription: String
        }]
    }),
    'students'
);

module.exports = Student;