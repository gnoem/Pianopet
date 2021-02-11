const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Teacher = mongoose.model(
    'Teacher',
    new Schema({
        username: String,
        password: String,
        students: [String], // string of student IDs
        wearableCategories: [String]
    }),
    'teachers'
);

module.exports = Teacher;