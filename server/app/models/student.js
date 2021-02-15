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
        avatar: [String],
        closet: [String],
        badges: [String]
    }),
    'students'
);

module.exports = Student;