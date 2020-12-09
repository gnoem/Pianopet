const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Teacher = mongoose.model(
    'Teacher',
    new Schema({
        username: String,
        password: String,
        students: [{
            studentId: String // schematype.objectId
        }]
    }),
    'teachers'
);

module.exports = Teacher;