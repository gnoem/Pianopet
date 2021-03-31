import { check } from 'express-validator';
import { isObjectId } from '../controllers/utils.js';
import { Student, Teacher, Category } from '../models/index.js';

export const validate = {
    wearable: [
        check('name')
            .not().isEmpty().withMessage('This field is required').bail()
            .isLength({ max: 60 }).withMessage('Max 60 characters'),
        check('src')
            .not().isEmpty().withMessage('This field is required'),
        check('value')
            .not().isEmpty().withMessage('This field is required')
    ],
    category: [
        check('name') // cant be "Color"
            .not().isEmpty().withMessage('This field is required').bail()
            .isLength({ max: 25 }).withMessage('Max 25 characters').bail()
            .custom((name, { req }) => {
                return Category.findOne({ name, teacherCode: req.body.teacherCode }).then(category => {
                    if (category) return Promise.reject('Category name already exists');
                });
            })
    ],
    badge: [
        check('name')
            .not().isEmpty().withMessage('This field is required').bail()
            .isLength({ max: 50 }).withMessage('Max 50 characters'),
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
    ],
    studentAccount: [
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
            .custom((username, { req }) => {
                return Student.findOne({ username }).then(user => {
                    if (user && (user._id.toString() !== req.params._id)) return Promise.reject('Username is taken');
                });
            })
    ],
    teacherAccount: [
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
            .custom((username, { req }) => {
                return Teacher.findOne({ username }).then(user => {
                    if (user && (user._id.toString() !== req.params._id)) return Promise.reject('Username is taken');
                });
            })
    ]
}