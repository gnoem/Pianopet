import { check } from 'express-validator';
import { isObjectId } from '../controllers/utils.js';
import { Student, Teacher } from '../models/index.js';

export const validate = {
    badgeName: [
        check('name')
            .not().isEmpty().withMessage('This field is required').bail()
            .isLength({ max: 50 }).withMessage('Max 50 characters'),
            // todo check if exists
        check('src')
            .not().isEmpty().withMessage('This field is required'),
        check('value')
            .not().isEmpty().withMessage('This field is required')
    ],
    studentSignup: [
        check('firstName')
            .not().isEmpty().withMessage('This field is required'),
        check('lastName')
            .not().isEmpty().withMessage('This field is required'),
        check('email')
            .not().isEmpty().withMessage('This field is required'),
        check('username')
            .not().isEmpty().withMessage('This field is required').bail()
            .isAlphanumeric().withMessage('Username cannot contain any special characters').bail()
            .isLength({ min: 2, max: 20 }).withMessage('Username must be between 2 and 20 characters').bail()
            .custom(username => {
                return Student.findOne({ username }).then(user => {
                    if (user) return Promise.reject('Username is taken');
                });
            }),
        check('password')
            .not().isEmpty().withMessage('This field is required').bail()
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        check('teacherCode')
            .not().isEmpty().withMessage('This field is required').bail()
            .custom(teacherCode => {
                if (!isObjectId(teacherCode)) return Promise.reject('Invalid teacher code');
                return Teacher.findOne({ _id: teacherCode }).then(teacher => {
                    if (!teacher) return Promise.reject('Teacher not found!')
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
            .not().isEmpty().withMessage('This field is required').bail()
            .isAlphanumeric().withMessage('Username cannot contain any special characters').bail()
            .isLength({ min: 2, max: 20 }).withMessage('Username must be between 2 and 20 characters').bail()
            .custom(username => {
                return Teacher.findOne({ username }).then(user => {
                    if (user) return Promise.reject('Username is taken');
                });
            }),
        check('password')
            .not().isEmpty().withMessage('This field is required').bail()
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ]
}