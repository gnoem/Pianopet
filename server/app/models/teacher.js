const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Teacher = mongoose.model(
    'Teacher',
    new Schema({
        firstName: String,
        lastName: String,
        email: String,
        username: String,
        password: String,
        profilePic: String,
        students: [String], // array of student IDs
        wearableCategories: [String]
    }),
    'teachers'
);

module.exports = Teacher;