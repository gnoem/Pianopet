const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Student = mongoose.model(
    'Student',
    new Schema({
        firstName: String,
        lastName: String,
        username: String,
        password: String,
        email: String,
        profilePic: String,
        teacherCode: String,
        coins: Number,
        avatar: [String],
        closet: [String],
        badges: [{
            id: String,
            redeemed: Boolean
        }]
    }),
    'students'
);

module.exports = Student;