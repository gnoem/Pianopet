const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Homework = mongoose.model(
    'Homework',
    new Schema({
        studentId: String,
        date: {
            type: Date,
            default: Date.now()
        },
        headline: String,
        assignments: [{
            label: String,
            progress: {
                type: Number,
                default: 0
            },
            recorded: {
                type: Boolean,
                default: false
            }
        }]
    }),
    'homework'
);

module.exports = Homework;