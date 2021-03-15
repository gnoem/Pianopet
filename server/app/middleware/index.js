import { check } from 'express-validator';
import { Student, Teacher } from '../models/index.js';

export const validate = {
    studentSignup: [
        check('firstName')
            .not().isEmpty().withMessage('This field is required'),
        check('lastName')
            .not().isEmpty().withMessage('This field is required'),
        check('email')
            .not().isEmpty().withMessage('This field is required'),
        check('username')
            .isAlphanumeric().withMessage('Username cannot contain any special characters')
            .isLength({ min: 2, max: 20 }).withMessage('Username must be between 2 and 20 characters')
            .not().isEmpty().withMessage('This field is required')
            .custom(username => {
                return Student.findOne({ username }).then(user => {
                    if (user) return Promise.reject('Username is taken');
                });
            }),
        check('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
            .not().isEmpty().withMessage('This field is required'),
        check('teacherCode')
            .not().isEmpty().withMessage('This field is required')
            .custom(teacherCode => {
                return Teacher.findOne({ _id: teacherCode }).then(teacher => {
                    if (!teacher) return Promise.reject('Invalid teacher code')
                });
            })
    ],
    teacherSignup: [
        check('firstName')
            .not().isEmpty().withMessage('This field is required'),
        check('lastName')
            .not().isEmpty().withMessage('This field is required'),
        check('email')
            .not().isEmpty().withMessage('This field is required'),
        check('username')
            .isAlphanumeric().withMessage('Username cannot contain any special characters')
            .isLength({ min: 2, max: 20 }).withMessage('Username must be between 2 and 20 characters')
            .custom(username => {
                return Teacher.findOne({ username }).then(user => {
                    if (user) return Promise.reject('Username is taken');
                });
            }),
        check('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ]
}