const { check } = require('express-validator');
const Student = require('../models/student');
const Teacher = require('../models/teacher');

const validate = {
    studentSignup: [
        check('username')
            .isAlphanumeric().withMessage('Username cannot contain any special characters')
            .isLength({ min: 2, max: 20 }).withMessage('Username must be between 2 and 20 characters')
            .custom(username => {
                return Student.findOne({ username: username }).then(user => {
                    if (user) return Promise.reject('Username is taken');
                })
            }),
        check('password')
            .isLength({ min: 6, max: 15 }).withMessage('Password must be between 6 and 15 characters')
    ],
    teacherSignup: [
        check('username')
            .isAlphanumeric().withMessage('Username cannot contain any special characters')
            .isLength({ min: 2, max: 20 }).withMessage('Username must be between 2 and 20 characters')
            .custom(username => {
                return Teacher.findOne({ username: username }).then(user => {
                    if (user) return Promise.reject('Username is taken');
                })
            }),
        check('password')
            .isLength({ min: 6, max: 15 }).withMessage('Password must be between 6 and 15 characters')
    ]
}

module.exports = { validate }