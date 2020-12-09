const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/secret');
const Student = require('../models/student');
// const Badge = require('../models/badge');

module.exports = (app) => {
    app.get('/auth', (req, res) => {
        const accessToken = req.cookies.auth;
        if (!accessToken) return res.send({ student: false });
        const decoded = jwt.verify(accessToken, config.secret);
        Student.findOne({ _id: decoded.id }, (err, student) => {
            if (err) return console.error('error', err);
            if (!student) return console.log('no student for that token... hmm');
            res.send({ student: student });
        });
    });
    app.get('/logout', (req, res) => {
        res.clearCookie('auth');
        res.redirect('/');
    });
    app.post('/student/login', (req, res) => {
        const { username, password } = req.body;
        Student.findOne({ username: username }, (err, user) => {
            if (err) return console.error('error signing in', err);
            if (!user) return console.log('User does not exist');
            const passwordIsValid = () => {
                bcrypt.compareSync(password, user.password);
            }
            if (!passwordIsValid) return console.log('invalid password');
            const accessToken = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });
            res.cookie('auth', accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000 // 1,000 hours
            });
            res.send({
                success: true,
                accessToken: accessToken
            });
        });
    });
    app.post('/student/signup', [
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
    ], (req, res) => {
        const { username, password } = req.body;
        console.dir(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty) return console.log('errors found...', errors);
        const newStudent = new Student({
            username: username,
            password: bcrypt.hashSync(password, 8)
        });
        newStudent.save(err => {
            if (err) return console.error('error saving...', err);
            const accessToken = jwt.sign({ id: newStudent.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });
            res.cookie('auth', accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000 // 1,000 hours
            });
            res.send({
                success: true,
                accessToken: accessToken
            });
        });
    });
    // ADMIN POWERS:
    // create badges
    // transfer coins
    // assign badges
    // create/update/delete homework
    // fill in homework progress

    // STUDENT POWERS:
    // fill in homework progress
    // redeem coins
}