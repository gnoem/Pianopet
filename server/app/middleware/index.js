import { isObjectId } from '../controllers/utils.js';
import { Student, Teacher, Category } from '../models/index.js';
import { fieldIsRequired, checkEmail, checkUsername, checkPassword } from './check.js';

export const validate = {
    homework: [
        fieldIsRequired('date'),
        fieldIsRequired('headline').trim()
    ],
    wearable: [
        fieldIsRequired('name').trim().isLength({ max: 60 }).withMessage('Max 60 characters'),
        fieldIsRequired('src').trim(),
        fieldIsRequired('value').trim()
    ],
    category: [
        fieldIsRequired('name')
            .isLength({ max: 25 }).withMessage('Max 25 characters').bail()
            .trim()
            .custom((name, { req }) => {
                const { teacherCode } = req.body;
                return Category.findOne({ name, teacherCode }).then(category => {
                    if (category || ['color', 'wallpaper'].includes(name.toLowerCase())) {
                        return Promise.reject('Category name already exists');
                    }
                });
            })
    ],
    badge: [
        fieldIsRequired('name').trim().isLength({ max: 50 }).withMessage('Maximum 50 characters'),
        fieldIsRequired('src').trim(),
        fieldIsRequired('value').trim()
    ],
    studentSignup: [
        fieldIsRequired('firstName').trim(),
        fieldIsRequired('lastName').trim(),
        checkEmail(Student),
        checkUsername(Student),
        checkPassword(),
        fieldIsRequired('teacherCode').trim().custom(teacherCode => {
            if (!isObjectId(teacherCode)) return Promise.reject('Invalid teacher code');
            return Teacher.findOne({ _id: teacherCode }).then(teacher => {
                if (!teacher) return Promise.reject('Teacher not found!')
            });
        })
    ],
    teacherSignup: [
        fieldIsRequired('firstName').trim(),
        fieldIsRequired('lastName').trim(),
        checkEmail(Teacher),
        checkUsername(Teacher),
        checkPassword()
    ],
    studentAccount: [
        fieldIsRequired('firstName').trim(),
        fieldIsRequired('lastName').trim(),
        checkEmail(Student),
        checkUsername(Student)
    ],
    teacherAccount: [
        fieldIsRequired('firstName').trim(),
        fieldIsRequired('lastName').trim(),
        checkEmail(Teacher),
        checkUsername(Teacher)
    ]
}