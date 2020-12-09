const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Homework = mongoose.model(
    'Homework',
    new Schema({
        studentId: String, // schematype.objectid
        date: Date,
        headline: String,
        assignments: [{
            title: String,
            progress: Number
        }]
    }),
    'homework'
);

module.exports = Homework;