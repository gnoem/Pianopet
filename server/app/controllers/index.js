const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/secret');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const Homework = require('../models/homework');
const Wearable = require('../models/wearable');
const Badge = require('../models/badge');

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
                return;
            }
            // [else...]
            const { teacherCode } = student;
            Teacher.findOne({ _id: teacherCode }, (err, teacher) => {
                if (err) return console.error(`error finding teacher ${teacherCode}`, err);
                if (!teacher) return console.log(`teacher ${teacherCode} not found`);
                Wearable.find({ teacherCode }, (err, wearables) => {
                    if (err) return console.error(`error finding wearables w/ teacherCode ${teacherCode}`, err);
                    if (!wearables || !wearables.length) console.log(`did not find any wearables w/ teacherCode ${teacherCode}`);
                    Badge.find({ teacherCode }, (err, badges) => {
                        if (err) return console.error(`error finding badges w/ teacherCode ${teacherCode}`, err);
                        if (!badges || !badges.length) console.log(`did not find any badges w/ teacherCode ${teacherCode}`);
                        return res.send({
                            success: true,
                            student,
                            teacher,
                            wearables,
                            badges
                        });
                    });
                });
            });
        });
    },
    login: (req, res) => {
        const { role, username, password } = req.body;
        const handleLogin = (err, user) => {
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
        }
        if (role === 'student') return Student.findOne({ username }, handleLogin);
        if (role === 'teacher') return Teacher.findOne({ username }, handleLogin);
    },
    logout: (req, res) => {
        res.clearCookie('auth');
        res.redirect('/');
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
        const { id } = req.params;
        Student.find({ teacherCode: id }, (err, students) => {
            if (err) return console.error('error finding students', err);
            if (!students || !students.length) console.log('this teacher has no students');
            Wearable.find({ teacherCode: id }, (err, wearables) => {
                if (err) return console.error('error finding wearables', err);
                if (!wearables || !wearables.length) console.log('this teacher hasnt uploaded any wearables');
                Badge.find({ teacherCode: id }, (err, badges) => {
                    if (err) return console.error('error finding badges', err);
                    if (!badges || !badges.length) console.log('this teacher hasnt uploaded any badges');
                    res.send({
                        success: true,
                        students,
                        wearables,
                        badges
                    });
                });
            });
        });
    },
    addHomework: (req, res) => {
        const { id } = req.params;
        const homework = {...req.body};
        const newHomework = new Homework({
            studentId: id,
            ...homework
        });
        newHomework.save(err => {
            if (err) return console.error('error saving homework', err);
            res.send({ success: true });
        });
    },
    deleteHomework: (req, res) => {
        const { id: _id } = req.params;
        Homework.findOneAndDelete({ _id }, (err, homework) => {
            if (err) return console.error('error deleting homework', err);
            if (!homework) return console.log(`homework ${_id} not found`);
            res.send({ success: true });
        });
    },
    getHomework: (req, res) => {
        const { id: studentId } = req.params;
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
        const { id: _id } = req.params;
        const { date, headline, assignments } = req.body;
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
        const { id: _id } = req.params;
        const { index, value } = req.body;
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
        const { id: _id } = req.params;
        const { index, recorded } = req.body;
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
        const { id: _id } = req.params;
        const { coins } = req.body;
        Student.findOne({ _id }, (err, student) => {
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
        if (!value) return console.log('invalid');
        const newWearable = new Wearable({ teacherCode, name, category, src, value });
        newWearable.save(err => {
            if (err) return console.error('error saving wearable', err);
            res.send({ success: true });
            console.log(`successfully added ${newWearable}`);
        }); // */
    },
    editWearable: (req, res) => {
        const { id: _id } = req.params;
        // todo validate name
        const { name, category, src, value } = req.body;
        Wearable.findOne({ _id }, (err, wearable) => {
            if (err) return console.error('error finding wearable', wearable);
            if (!wearable) return console.log(`wearable ${_id} not found`);
            wearable.name = name;
            wearable.category = category;
            wearable.src = src;
            wearable.value = value;
            wearable.save(err => {
                if (err) return console.error('error saving wearable', err);
                res.send({ success: true });
                console.log(`successfully edited wearable ${_id}`);
            });
        });
    },
    deleteWearable: (req, res) => {
        const { _id } = req.params;
        Wearable.findOneAndDelete({ _id }, (err, wearable) => {
            if (err) return console.error('error finding and deleting wearable', err);
            if (!wearable) console.log(`no wearable with _id ${_id}`);
            res.send({ success: true });
        });
    },
    addBadge: (req, res) => {
        // todo validate name
        const { teacherCode, name, src, value } = req.body;
        const newBadge = new Badge({ teacherCode, name, src, value });
        newBadge.save(err => {
            if (err) return console.error('error saving badge', err);
            res.send({ success: true });
            console.log(`successfully added ${newBadge}`);
        }); // */
    },
    editBadge: (req, res) => {
        const { id: _id } = req.params;
        // todo validate name
        const { name, src, value } = req.body;
        Badge.findOne({ _id }, (err, badge) => {
            if (err) return console.error('error finding badge', badge);
            if (!badge) return console.log(`badge ${_id} not found`);
            badge.name = name;
            badge.src = src;
            badge.value = value;
            badge.save(err => {
                if (err) return console.error('error saving badge', err);
                res.send({ success: true });
            });
        });
    },
    deleteBadge: (req, res) => {
        const { id: _id } = req.params;
        Badge.findOneAndDelete({ _id }, (err, badge) => {
            if (err) return console.error('error finding and deleting badge', err);
            if (!badge) console.log(`no badge with _id ${_id}`);
            res.send({ success: true });
        });
    },
    addWearableCategory: (req, res) => {
        const { id: _id } = req.params;
        // todo validate name
        const { categoryName } = req.body;
        Teacher.findOne({ _id }, (err, user) => {
            if (err) return console.error(`error finding user ${_id}`, err);
            if (!user) return console.log(`user ${_id} not found`);
            user.wearableCategories.push(categoryName);
            user.save(err => {
                if (err) return console.error('error saving user', err);
                res.send({ success: true });
            });
        });
    },
    editWearableCategory: (req, res) => {
        const { id: _id } = req.params;
        const { originalName, updatedName } = req.body;
        Teacher.findOne({ _id }, (err, user) => {
            if (err) return console.error(`error finding user ${_id}`, err);
            if (!user) return console.log(`user ${_id} not found`);
            const index = user.wearableCategories.indexOf(originalName);
            user.wearableCategories.splice(index, 1, updatedName);
            Wearable.find({ teacherCode: _id, category: originalName }, (err, wearables) => {
                if (err) return console.error(`error finding wearables with teacherCode ${_id} and category ${originalName}`, err);
                if (!wearables || !wearables.length) console.log(`no wearables with the category "${originalName}" found`);
                for (let wearable of wearables) {
                    wearable.category = updatedName;
                    wearable.save(err => {
                        if (err) console.log(`Error saving wearable ${_id} "${wearable.name}"`)
                    });
                }
                user.save(err => {
                    if (err) return console.error('error saving user', err);
                    res.send({ success: true });
                });
            });
        });
    },
    updateCloset: (req, res) => {
        const { id: _id } = req.params;
        const { wearableId, wearableCost } = req.body;
        Student.findOne({ _id }, (err, student) => {
            if (err) return console.error(`error finding student ${_id}`, err);
            if (!student) return console.log(`student ${_id} not found`);
            if (!student.closet) student.closet = [wearableId];
            else if (!student.closet.includes(wearableId)) student.closet.push(wearableId);
            student.coins -= wearableCost;
            student.save(err => {
                if (err) return console.error(`error saving student ${_id}`, err);
                return res.send({ success: true });
            });
        });
    },
    updateAvatar: (req, res) => {
        const { id: _id } = req.params;
        const { avatar } = req.body;
        Student.findOne({ _id }, (err, student) => {
            if (err) return console.error(`error finding student ${_id}`, err);
            if (!student) return console.log(`student ${_id} not found`);
            student.avatar = avatar;
            student.save(err => {
                if (err) return console.error(`error saving student ${_id}`, err);
                return res.send({ success: true });
            });
        })
    }
}