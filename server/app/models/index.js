import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const Category = mongoose.model(
    'Category',
    new Schema({
        teacherCode: String,
        name: String,
        index: Number,  // position in list
        order: Number   // layer/depth
    }),
    'categories'
);

export const Homework = mongoose.model(
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

export const Student = mongoose.model(
    'Student',
    new Schema({
        firstName: String,
        lastName: String,
        username: String,
        password: String,
        email: String,
        profilePic: String,
        teacherCode: String,
        coins: {
            type: Number,
            default: 0
        },
        avatar: [String],
        closet: [String],
        badges: [{
            id: String,
            redeemed: Boolean
        }]
    }),
    'students'
);

export const Teacher = mongoose.model(
    'Teacher',
    new Schema({
        firstName: String,
        lastName: String,
        email: String,
        username: String,
        password: String,
        profilePic: String,
        students: [String] // array of student IDs
    }),
    'teachers'
);

export const Wearable = mongoose.model(
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
        ownedBy: [String],  // string of student IDs in case teacher wants to delete wearable
                            // we know which students own this item and don't have to loop through all students to check
        occupies: [String]  // array of category IDs
    }),
    'wearables'
);

export const Badge = mongoose.model(
    'Badge',
    new Schema({
        teacherCode: String,
        name: String,
        src: String,
        value: Number,
        awardedTo: [String] // string of student IDs
    }),
    'badges'
)