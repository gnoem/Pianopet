const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Student = mongoose.model(
    'Student',
    new Schema({
        firstName: String,
        lastName: String,
        username: String,
        password: String,
        teacherCode: String,
        coins: Number,
        avatar: {
            body: String
        },
        closet: String, // going to be object with keys 'eyes', 'hat', etc. that have arrays of strings as values
        badges: [String]
    }),
    'students'
);

module.exports = Student;