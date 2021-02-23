const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Wearable = mongoose.model(
    'Wearable',
    new Schema({
        teacherCode: String,
        name: String,
        category: String,
        value: Number,
        src: String,
        image: {
            w: Number,
            x: Number,
            y: Number
        },
        ownedBy: [String]   // string of student IDs in case teacher wants to delete wearable
                            // we know which students own this item and don't have to loop through all students to check
    }),
    'wearables'
);

module.exports = Wearable;