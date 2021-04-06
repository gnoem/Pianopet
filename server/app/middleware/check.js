import { check } from "express-validator";

export const fieldIsRequired = (fieldName) => {
    return check(fieldName).notEmpty().withMessage('This field is required').bail();
}

export const checkUsername = (User) => {
    return fieldIsRequired('username')
        .isAlphanumeric().withMessage('Username cannot contain any special characters').bail()
        .isLength({ max: 25 }).withMessage('Maximum 25 characters').bail()
        .trim()
        .custom((username, { req }) => {
            return User.findOne({ username }).then(user => {
                if (user && (user._id.toString() !== req.params?._id)) return Promise.reject('Username is taken');
            });
        })
}

export const checkPassword = () => {
    return fieldIsRequired('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters').bail();
}

export const checkEmail = (User) => {
    return fieldIsRequired('email')
        .isEmail().withMessage('Please enter a valid email address').bail()
        .normalizeEmail()
        .trim()
        .custom((email, { req }) => {
            return User.findOne({ email }).then(user => {
                if (user && (user._id.toString() !== req.params?._id)) return Promise.reject('Email address is already in use');
            });
        });
}