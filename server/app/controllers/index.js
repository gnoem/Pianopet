const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/secret');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const Homework = require('../models/homework');
const Wearable = require('../models/wearable');

module.exports = {
    auth: (req, res) => {
        const accessToken = req.cookies.auth;
        if (!accessToken) return res.send({ student: false, teacher: false });
        const decoded = jwt.verify(accessToken, config.secret);
        Student.findOne({ _id: decoded.id }, (err, student) => {
            if (err) {
                console.error('error', err);
                res.send({ success: false });
                return;
            }
            if (!student) {
                Teacher.findOne({ _id: decoded.id }, (err, teacher) => {
                    if (err) {
                        console.error('error finding teacher', err);
                        res.send({ success: false });
                        return;
                    }
                    if (!teacher) {
                        console.error('no student OR teacher w that ID', err);
                        res.send({ success: false });
                        return;
                    } // LOGOUT!!!!!
                    return res.send({ success: true, teacher: teacher });
                });
            }
            else return res.send({ success: true, student: student });
        });
    },
    logout: (req, res) => {
        res.clearCookie('auth');
        res.redirect('/');
    },
    studentLogin: (req, res) => {
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
    },
    studentSignup: (req, res) => {
        const { firstName, lastName, username, password, teacherCode } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) return console.log('errors found...', errors);
        const newStudent = new Student({
            firstName: firstName,
            lastName: lastName,
            username: username,
            password: bcrypt.hashSync(password, 8),
            teacherCode: teacherCode,
            coins: 0
        });
        newStudent.save(err => {
            if (err) return console.error('error saving student...', err);
            Teacher.findOne({ _id: teacherCode }, (err, teacher) => {
                if (err) return console.error('error finding teacher...', err);
                if (!teacher) return console.log('teacher code is invalid');
                teacher.students.push(newStudent._id);
                teacher.save(err => {
                    if (err) return console.error('error saving teacher...', err);
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
        });
    },
    teacherLogin: (req, res) => {
        const { username, password } = req.body;
        Teacher.findOne({ username: username }, (err, user) => {
            if (err) {
                console.error('error signing in...', err);
                res.send({ success: false });
                return;
            }
            if (!user) {
                console.error('user does not exist');
                res.send({ success: false });
                return;
            }
            const passwordIsValid = () => {
                bcrypt.compareSync(password, user.password);
            }
            if (!passwordIsValid) {
                console.error('invalid password');
                res.send({ success: false });
                return;
            }
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
    },
    teacherSignup: (req, res) => {
        const { username, password } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty) {
            console.log('errors found...', errors);
            res.send({ success: false });
            return;
        }
        const newTeacher = new Teacher({
            username: username,
            password: bcrypt.hashSync(password, 8),
            students: []
        });
        newTeacher.save(err => {
            if (err) {
                console.error('error saving...', err);
                res.send({ success: false });
                return;
            }
            const accessToken = jwt.sign({ id: newTeacher.id }, config.secret, {
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
    },
    getTeacherData: (req, res) => {
        const { _id } = req.body;
        Student.find({ teacherCode: _id }, (err, students) => {
            if (err) return console.error('error finding students', err);
            if (!students || !students.length) console.log('this teacher has no students');
            Wearable.find({ teacherCode: _id }, (err, wearables) => {
                if (err) return console.error('error finding wearables', err);
                if (!wearables || !wearables.length) console.log('this teacher hasnt uploaded any wearables');
                res.send({
                    success: true,
                    students,
                    wearables
                });
            });
        });
    },
    getStudents: (req, res) => {
        const { id } = req.params;
        Student.find({ teacherCode: id }, (err, students) => {
            if (err) return console.error('error finding students', err);
            if (!students) return console.log('this teacher has no students');
            res.send({
                students: students
            });
        })
    },
    addHomework: (req, res) => {
        const newHomework = new Homework(req.body);
        newHomework.save(err => {
            if (err) return console.error('error saving homework', err);
            res.send({ success: true });
        }); // */
    },
    deleteHomework: (req, res) => {
        const { _id } = req.body;
        Homework.findOneAndDelete({ _id }, (err, homework) => {
            if (err) return console.error('error deleting homework', err);
            if (!homework) return console.log(`homework ${_id} not found`);
            res.send({ success: true });
        });
    },
    getHomework: (req, res) => {
        const { studentId } = req.body;
        Homework.find({ studentId }).sort({ date: 'desc' }).exec((err, homework) => {
            if (err) return console.error('error finding homework', err);
            if (!homework) {
                console.log('no homework exists for this student');
                res.send({ success: false });
                return;
            }
            res.send({
                success: true,
                homework: homework
            });
        });
    },
    editHomework: (req, res) => {
        const { _id, date, headline, assignments } = req.body;
        Homework.findOne({ _id }, (err, homework) => {
            if (err) return console.error('error finding homework', err);
            if (!homework) return console.log(`homework ${_id} not found!`);
            homework.date = date;
            homework.headline = headline;
            homework.assignments = assignments;
            homework.save(err => {
                if (err) return console.error('error saving homework', err);
                res.send({ success: true });
                return;
            });
        });
    },
    updateProgress: (req, res) => {
        const { _id, index, value } = req.body;
        Homework.findOne({ _id }, (err, homework) => {
            if (err) return console.error('error finding homework', err);
            if (!homework) return console.log(`homework ${_id} not found`);
            homework.assignments[index].progress = value;
            homework.save(err => {
                if (err) return console.error('error saving homework', err);
                res.send({ success: true });
                return;
            });
        });
    },
    updateRecorded: (req, res) => {
        const { _id, index, recorded } = req.body;
        Homework.findOne({ _id }, (err, homework) => {
            if (err) return console.error('error finding homework', err);
            if (!homework) return console.log(`homework ${_id} not found`);
            homework.assignments[index].recorded = recorded;
            homework.save(err => {
                if (err) return console.error('error saving homework', err);
                res.send({ success: true });
                return;
            });
        });
    },
    updateCoins: (req, res) => {
        const { studentId, coins } = req.body;
        Student.findOne({ _id: studentId }, (err, student) => {
            if (err) return console.error('error finding student', err);
            if (!student) return console.log('no student with that ID');
            student.coins = coins;
            student.save(err => {
                if (err) return console.error('error saving student', err);
                res.send({ success: true });
                console.log(`success; student coins is ${student.coins}`);
            });
        });
    },
    addWearable: (req, res) => {
        // todo validate name
        const { teacherCode, name, category, src, value } = req.body;
        const newWearable = new Wearable({ teacherCode, name, category, src, value });
        newWearable.save(err => {
            if (err) return console.error('error saving wearable', err);
            res.send({ success: true });
            console.log(`successfully added ${newWearable}`);
        }); // */
    }
}