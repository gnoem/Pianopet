import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Student, Teacher, Homework, Wearable, Category, Badge } from '../models/index.js';

const secretKey = process.env.SECRET_KEY;

const Resource = {
    create: async({ Model, body }) => {
        const newThing = new Model(body);
        const success = await newThing.save();
        if (!success) throw new Error(`Error saving new ${Model.modelName}`);
        return success;
    },
    get: async ({ Model, params }) => {
        let resource = await Model.findOne(params);
        if (!resource) throw new Error(`${Model.modelName} {${JSON.stringify(params)}} not found`);
        return resource;
    },
    edit: async (resource, formData) => {
        resource = Object.assign(resource, formData);
        const success = await resource.save();
        if (!success) throw new Error(`Error saving resource`);
        return success;
    },
    delete: async ({ Model, params }) => {
        let success = await Model.deleteOne(params);
        if (!success) throw new Error(`Error deleting resources`);
        return success;
    }
}

/*
patterns:
- update array - e.g. student.badges.findIndex(callback) then student.badges[index] = someValue;
    but throw error if index === -1
- every mongoose crud function ends the same way:
    .then(success => {
        res.send({ success });
    }).catch(err => {
        res.send({
            success: false,
            error: err.message
        });
    });
*/

export default {
    custom: (req, res) => {
        console.log('hi');
    },
    auth: (req, res) => {
        const accessToken = req.cookies.auth;
        if (!accessToken) return res.send({ student: false, teacher: false });
        const decoded = jwt.verify(accessToken, secretKey);
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
                    return res.send({
                        success: true,
                        teacher
                    });
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
                    Category.find({ teacherCode }, (err, categories) => {
                        if (err) return console.error(`error finding categories w/ teacherCode ${teacherCode}`, err);
                        if (!categories || !categories.length) console.log(`did not find any categories w/ teacherCode ${teacherCode}`);
                        Badge.find({ teacherCode }, (err, badges) => {
                            if (err) return console.error(`error finding badges w/ teacherCode ${teacherCode}`, err);
                            if (!badges || !badges.length) console.log(`did not find any badges w/ teacherCode ${teacherCode}`);
                            return res.send({
                                success: true,
                                student,
                                teacher,
                                wearables,
                                categories,
                                badges
                            });
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
            if (!user) {
                res.send({
                    success: false,
                    errors: {
                        username: 'Username not found'
                    }
                });
                return;
            }
            const passwordIsValid = bcrypt.compareSync(password, user.password);
            if (!passwordIsValid) {
                res.send({
                    success: false,
                    errors: {
                        password: 'Invalid password'
                    }
                });
                return;
            }
            const accessToken = jwt.sign({ id: user.id }, secretKey, {
                expiresIn: 86400 // 24 hours
            });
            res.cookie('auth', accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000 // 1,000 hours
            });
            res.send({
                success: true
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
                    const accessToken = jwt.sign({ id: newStudent.id }, secretKey, {
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
            students: [],
            wearableCategories: ['Color']
        });
        newTeacher.save(err => {
            if (err) {
                console.error('error saving...', err);
                res.send({ success: false });
                return;
            }
            const accessToken = jwt.sign({ id: newTeacher.id }, secretKey, {
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
    getTeacher: (req, res) => {
        const { id } = req.params;
        Student.find({ teacherCode: id }, (err, students) => {
            if (err) return console.error('error finding students', err);
            if (!students || !students.length) console.log('this teacher has no students');
            Wearable.find({ teacherCode: id }, (err, wearables) => {
                if (err) return console.error('error finding wearables', err);
                if (!wearables || !wearables.length) console.log('this teacher hasnt uploaded any wearables');
                Category.find({ teacherCode: id }, (err, categories) => {
                    if (err) return console.error('error finding categories', err);
                    if (!categories || !categories.length) console.log('this teacher hasnt created any categories');
                    Badge.find({ teacherCode: id }, (err, badges) => {
                        if (err) return console.error('error finding badges', err);
                        if (!badges || !badges.length) console.log('this teacher hasnt uploaded any badges');
                        res.send({
                            success: true,
                            students,
                            wearables,
                            categories,
                            badges
                        });
                    });
                });
            });
        });
    },
    editAccount: (req, res) => {
        const { id: _id } = req.params;
        const formData = req.body;
        const editAccount = (err, user) => {
            if (err) return console.error(`error finding user ${_id}`, err);
            if (!user) return console.log(`user ${_id} not found`);
            user = Object.assign(user, formData);
            user.save(err => {
                if (err) return console.error(`error saving user ${_id}`, err);
                res.send({ success: true });
                return;
            });
        }
        if (formData.role === 'teacher') Teacher.findOne({ _id }, editAccount);
        if (formData.role === 'student') Student.findOne({ _id }, editAccount);
    },
    editPassword: (req, res) => {
        const { id: _id } = req.params;
        const { role, newPassword } = req.body;
        const editPassword = (err, user) => {
            if (err) return console.error(`error finding user ${_id}`, err);
            if (!user) return console.log(`user ${_id} not found`);
            user.password = bcrypt.hashSync(newPassword, 8);
            user.save(err => {
                if (err) return console.error(`error saving user ${_id}`, err);
                res.send({ success: true });
                return;
            });
        }
        if (role === 'teacher') Teacher.findOne({ _id }, editPassword);
        if (role === 'student') Student.findOne({ _id }, editPassword);
    },
    addHomework: (req, res) => {
        const { id: studentId } = req.params;
        const newHomework = { studentId, ...req.body };
        Resource.create({
            Model: Homework,
            body: newHomework
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
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
        Homework.findOne({ _id }).then(homework => {
            if (!homework) throw new Error(`Homework ${_id} not found`);
            homework = Object.assign(homework, { date, headline, assignments });
            return homework.save();
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    updateProgress: (req, res) => {
        const { id: _id } = req.params;
        const { index, value } = req.body;
        Homework.findOne({ _id }).then(homework => {
            if (!homework) throw new Error(`Homework ${_id} not found`);
            homework.assignments[index].progress = value;
            return homework.save();
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    updateRecorded: (req, res) => {
        const { id: _id } = req.params;
        const { index, recorded } = req.body;
        Homework.findOne({ _id }).then(homework => {
            if (!homework) throw new Error(`Homework ${_id} not found`);
            homework.assignments[index].recorded = recorded;
            return homework.save();
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    updateCoins: (req, res) => {
        const { id: _id } = req.params;
        const { coins } = req.body;
        Student.findOne({ _id }).then(student => {
            if (!student) throw new Error(`Student ${_id} not found`);
            student = Object.assign(student, coins);
            return student.save() // todo handle error
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    addWearable: (req, res) => {
        // todo validate name
        const { teacherCode, name, category, src, value, image } = req.body;
        const newWearable = category === 'color'
            ? { teacherCode, name, category, src, value }
            : { teacherCode, name, category, src, value, image };
        Resource.create({
            Model: Wearable,
            body: newWearable
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    editWearable: (req, res) => {
        const { id: _id } = req.params;
        // todo validate name
        Wearable.findOne({ _id }).then(wearable => {
            if (!wearable) throw new Error(`Wearable ${_id} not found`);
            wearable = Object.assign(wearable, req.body);
            return wearable.save();
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    deleteWearable: (req, res) => {
        const { id: _id } = req.params;
        Wearable.findOneAndDelete({ _id }, (err, wearable) => {
            if (err) return console.error('error finding and deleting wearable', err);
            if (!wearable) return console.log(`no wearable with _id ${_id}`);
            // deleting wearable from students' closets as well
            if (wearable.ownedBy) { // if array exists and its length > 0
                for (let [index, studentId] of wearable.ownedBy.entries()) {
                    Student.findOne({ _id: studentId }, (err, student) => {
                        if (err) return console.error(`error finding student ${studentId}`, err);
                        if (!student) return console.log(`no student with id ${studentId}`);
                        const removeWearable = (id, array) => {
                            const index = array.indexOf(id);
                            if (index !== -1) array.splice(index, 1);
                        }
                        removeWearable(_id, student.closet);
                        removeWearable(_id, student.avatar);
                        student.save(err => {
                            if (err) return console.error(`error saving student ${studentId}`, err);
                            console.log(`removed ${_id} from closet and avatar of student ${studentId}`);
                            if (index === wearable.ownedBy.length - 1) res.send({ success: true }); // todo better please
                        });
                    });
                }
            }
        });
    },
    addBadge: (req, res) => {
        // todo validate name
        const { teacherCode, name, src, value } = req.body;
        const newBadge = { teacherCode, name, src, value };
        Resource.create({
            Model: Badge,
            body: newBadge
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    editBadge: (req, res) => {
        const { id: _id } = req.params;
        // todo validate name
        Badge.findOne({ _id }).then(badge => {
            if (!badge) throw new Error(`Badge ${_id} not found`);
            badge = Object.assign(badge, req.body);
            return badge.save();
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    deleteBadge: (req, res) => {
        const { id: _id } = req.params;
        Badge.findOneAndDelete({ _id }, (err, badge) => {
            if (err) return console.error('error finding and deleting badge', err);
            if (!badge) return console.log(`no badge with _id ${_id}`);
            if (badge.awardedTo) {
                for (let [index, studentId] of badge.awardedTo.entries()) {
                    Student.findOne({ _id: studentId }, (err, student) => {
                        if (err) return console.error(`error finding student ${studentId}`, err);
                        if (!student) return console.log(`no student with id ${studentId}`);
                        const removeBadge = (id, array) => {
                            // student.badges array contains some object such that object.id === badge._id
                            // find its index and splice it out
                            const index = array.findIndex(object => object.id === id);
                            if (index !== -1) array.splice(index, 1);
                        }
                        removeBadge(_id, student.badges);
                        student.save(err => {
                            if (err) return console.error(`error saving student ${studentId}`, err);
                            console.log(`removed ${_id} from badgelist of student ${studentId}`);
                            if (index + 1 === badge.awardedTo.length) res.send({ success: true }); // todo better please
                        });
                    });
                }
            }
            res.send({ success: true });
        });
    },
    addWearableCategory: (req, res) => {
        const { id: _id } = req.params;
        // todo validate name - can't be duplicate, also can't be "Color" (case insensitive)
        return console.log('add wearable category is udner construction');
        const { categoryName } = req.body;
        const newCategory = new Category({
            teacherCode: _id,
            name: categoryName
        });
        newCategory.save(err => {
            if (err) return console.error(err);
            res.send({
                success: true
            });
        });
        return;
        Resource.get({
            Model: Teacher,
            params: { _id }
        }).then(teacher => {

            teacher.wearableCategories.push(newCategory._id);
            return teacher.save(); // todo handle error
        }).then(() => {
            const newCategoryBody = {
                teacherCode: _id,
                name: categoryName
            }
            return Resource.create({ // todo handle error
                Model: Category,
                body: newCategoryBody
            });
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    editWearableCategory: (req, res) => {
        const { id: teacherCode } = req.params;
        const { _id, categoryName } = req.body;
        // todo validate name
        Category.findOne({ _id }).then(category => {
            if (!category) throw new Error(`Category ${_id} not found`);
            category = Object.assign(category, { name: categoryName });
            return category.save();
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    deleteWearableCategory: async (req, res) => {
        const { id: teacherCode } = req.params;
        const { _id, reassignWearables } = req.body;
        return console.log('delete category is under construction');
        Category.findOneAndRemove({ _id }).then(category => {
            return Teacher.findOne({ _id: category.teacherCode });
        }).then(teacher => {
            const index = teacher.wearableCategories.indexOf(_id);
            if (index === -1) throw new Error(`Category ${_id} does not belong to teacher ${teacherCode}`);
            teacher.wearableCategories.splice(index, 1);
            return teacher.save();
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
        Teacher.findOne({ _id: teacherCode }, (err, teacher) => {
            if (err) return console.error(`error finding teacher ${teacherCode}`, err);
            if (!teacher) return console.log(`teacher ${teacherCode} not found`);
            const index = teacher.wearableCategories.indexOf(_id);
            if (index === -1) return console.log(`category ${_id} doesn't appear to belong to teacher ${teacherCode}`);
            teacher.wearableCategories.splice(index, 1);
            Wearable.find({ category: _id }, (err, wearables) => {
                if (err) return console.error(`error finding wearables`, err);
                if (!wearables || !wearables.length) console.log(`no wearables to reassign`);
                else for (let [index, wearable] of wearables.entries()) {
                    wearable.category = reassignWearables;
                    wearable.save(err => {
                        if (err) return console.error(`error saving wearable ${index} (${wearable._id})`, err);
                    });
                }
                Category.findOneAndDelete({ _id, teacherCode }, (err, category) => {
                    if (err) return console.error(`error finding category`, err);
                    if (!category) return console.log(`category "${_id}" with teacherCode "${teacherCode}" not found`);
                    teacher.save(err => {
                        if (err) return console.error(`error saving teacher`, err);
                        res.send({ success: true });
                    });//
                });
            });
        });
    },
    updateBadges: (req, res) => {
        const { id: _id } = req.params;
        const { badgeId } = req.body;
        Student.findOne({ _id }, (err, student) => {
            if (err) return console.error(`error finding student ${_id}`, err);
            if (!student) return console.log(`couldn't find student ${_id}`);
            if (!student.badges) student.badges = [{
                id: badgeId,
                redeemed: false
            }];
            const alreadyHasBadge = () => {
                const index = student.badges.findIndex(object => object.id === badgeId);
                if (index === -1) return false;
                return true;
            }
            if (alreadyHasBadge()) return res.send({
                success: false,
                error: 'This student already has this badge'
            });
            else student.badges.push({
                id: badgeId,
                redeemed: false
            });
            student.save(err => {
                if (err) return console.error(`error saving student ${_id}`, err);
                return res.send({ success: true });
            });
        });
    },
    updateBadgeRedeemed: (req, res) => {
        const { id: _id } = req.params;
        const { badgeId, badgeValue } = req.body;
        Student.findOne({ _id }).then(student => {
            if (!student) throw new Error(`Student ${_id} not found`);
            const index = student.badges.findIndex(object => object.id === badgeId);
            const studentHasBadge = index !== -1;
            if (!studentHasBadge) throw new Error(`Student doesn't have this badge`);
            student.badges[index].redeemed = true;
            student.coins += badgeValue;
            return student.save();
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    updateCloset: (req, res) => {
        const { id: _id } = req.params;
        const { wearableId, wearableCost } = req.body;
        Student.findOne({ _id }).then(student => {
            if (!student.closet) student.closet = [wearableId];
            if (student.closet.includes(wearableId))
                throw new Error(`Student already owns this wearable`);
            student.closet.push(wearableId);
            student.coins -= wearableCost;
            return student.save();
        }).then(() => {
            return Wearable.findOne({ _id: wearableId });
        }).then(wearable => {
            if (!wearable.ownedBy) wearable.ownedBy = [_id];
            wearable.ownedBy.push(_id);
            return wearable.save();
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    },
    updateAvatar: (req, res) => {
        const { id: _id } = req.params;
        const { avatar } = req.body;
        Student.findOne({ _id }).then(student => {
            if (!student) throw new Error(`Student ${_id} not found`);
            student = Object.assign(student, { avatar });
            return student.save();
        }).then(success => {
            res.send({ success });
        }).catch(err => {
            res.send({
                success: false,
                error: err.message
            });
        });
    }
}