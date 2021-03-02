const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = mongoose.model(
    'Category',
    new Schema({
        teacherCode: String,
        name: String,
        order: Number
    }),
    'categories'
);

module.exports = Category;