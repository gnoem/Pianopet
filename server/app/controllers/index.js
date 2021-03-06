import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Student, Teacher, Homework, Wearable, Category, Badge } from '../models/index.js';

const secretKey = process.env.SECRET_KEY;

/*
patterns:
- run().catch(err)
- simple update resource: Document.findOne({ _id }) then document = Object.assign(document, data);
- update array - e.g. student.badges.findIndex(callback) then student.badges[index] = someValue;
    but throw error if index === -1
*/

const handle = (promise) => {
    return promise
        .then(data => ([data, undefined]))
        .catch(err => Promise.resolve([undefined, err]));
}

class Controller {
    custom = () => {
        console.log('hi')
    }
    auth = (req, res) => {
        const accessToken = req.cookies?.auth;
        if (!accessToken) return res.send({ student: false, teacher: false });
        const decoded = jwt.verify(accessToken, secretKey);
        const run = async () => {
            const [student, studentError] = await handle(Student.findOne({ _id: decoded.id }));
            if (studentError) throw new Error(`Error finding student ${_id}`);
            if (student) return this.getStudent(res, student); // todo figure out if better way to res.send than passing res
            const [teacher, teacherError] = await handle(Teacher.findOne({ _id: decoded.id }));
            if (teacherError) throw new Error(`Error finding user ${_id}`);
            if (!teacher) throw new Error(`User ${_id} not found`); // and delete cookie? todo figure out
            this.getTeacher(res, teacher);
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    getStudent = (res, student) => {
        const { teacherCode } = student;
        const run = async () => {
            const [foundData, dataError] = await handle(Promise.all([
                Teacher.findOne({ _id: teacherCode }),
                Wearable.find({ teacherCode }),
                Category.find({ teacherCode }),
                Badge.find({ teacherCode })
            ]));
            if (dataError) throw new Error(`Error retrieving data associated with teacher ${teacherCode}`);
            if (!foundData) throw new Error(`Could not find any data associated with teacher ${teacherCode}`);
            const [teacher, wearables, categories, badges] = foundData;
            const studentData = { student, teacher, wearables, categories, badges };
            res.send({ success: true, studentData });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    getTeacher = (res, teacher) => {
        const { _id: teacherCode } = teacher;
        const run = async () => {
            const [foundData, dataError] = await handle(Promise.all([
                Student.find({ teacherCode }),
                Wearable.find({ teacherCode }),
                Category.find({ teacherCode }),
                Badge.find({ teacherCode })
            ]));
            if (dataError) throw new Error(`Error retrieving data for teacher ${teacherCode}`);
            if (!foundData) throw new Error(`Could not find any data associated with teacher ${teacherCode}`);
            const [students, wearables, categories, badges] = foundData;
            const teacherData = { teacher, students, wearables, categories, badges };
            res.send({ success: true, teacherData });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    login = (req, res) => {
        const { role, username, password } = req.body;
        const run = async () => {
            const User = role === 'student' ? Student : Teacher;
            const [user, userError] = await handle(User.findOne({ username }));
            if (userError) throw new Error(`Error finding ${role} ${username}`);
            if (!user) throw new Error(`${role} ${username} not found`);
            const passwordIsValid = bcrypt.compareSync(password, user.password);
            if (!passwordIsValid) throw new Error(`Invalid password`);
            // TODO see if error can be turned into res.send({ success: false, errors: { password: 'Invalid password' } })
            const accessToken = jwt.sign({ id: user.id }, secretKey, {
                expiresIn: 86400 // 24 hours
            });
            res.cookie('auth', accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000 // 1,000 hours
            });
            res.send({ success: user });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    logout = (req, res) => {
        res.clearCookie('auth');
        res.redirect('/');
    }
    studentSignup = (req, res) => {
        const { firstName, lastName, username, password, teacherCode } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) return console.log('errors found...', errors);
        const run = async () => {
            const [student, studentError] = await handle(Student.create({
                firstName,
                lastName,
                username,
                password: bcrypt.hashSync(password, 8),
                teacherCode
            }));
            if (studentError) throw new Error(`Error creating new student`);
            const accessToken = jwt.sign({ id: student.id }, secretKey, {
                expiresIn: 86400 // 24 hours
            });
            res.cookie('auth', accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000 // 1,000 hours
            });
            res.send({
                success: student,
                accessToken
            });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    teacherSignup = (req, res) => {
        const { username, password } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) return console.log('errors found...', errors);
        const run = async () => {
            const [teacher, teacherError] = await handle(Teacher.create({
                firstName,
                lastName,
                username,
                password: bcrypt.hashSync(password, 8)
            }));
            if (teacherError) throw new Error(`Error creating new student`);
            const accessToken = jwt.sign({ id: teacher.id }, secretKey, {
                expiresIn: 86400 // 24 hours
            });
            res.cookie('auth', accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000 // 1,000 hours
            });
            res.send({
                success: teacher,
                accessToken
            });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editAccount = (req, res) => {
        const { id: _id } = req.params;
        const { role, firstName, lastName, username, email, profilePic } = req.body;
        const run = async () => {
            const User = role === 'student' ? Student : Teacher;
            let [user, userError] = await handle(User.findOne({ _id }));
            if (userError) throw new Error(`Error finding user ${_id}`);
            if (!user) throw new Error(`User ${_id} not found`);
            user = Object.assign(user, { firstName, lastName, username, email, profilePic });
            const [success, saveError] = await handle(user.save());
            if (saveError) throw new Error(`Error saving user ${_id}`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editPassword = (req, res) => {
        const { id: _id } = req.params;
        const { role, newPassword } = req.body;
        const run = async () => {
            const User = role === 'student' ? Student : Teacher;
            let [user, userError] = await handle(User.findOne({ _id }));
            if (userError) throw new Error(`Error finding user ${_id}`);
            if (!user) throw new Error(`User ${_id} not found`);
            user = Object.assign(user, { password: bcrypt.hashSync(newPassword, 8) });
            const [success, saveError] = await handle(user.save());
            if (saveError) throw new Error(`Error saving user ${_id}`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    addHomework = (req, res) => {
        const { id: studentId } = req.params;
        const run = async () => {
            const [homework, homeworkError] = await handle(Homework.create({ studentId, ...req.body }));
            if (homeworkError) throw new Error(`Error creating new homework`);
            res.send({ success: homework });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    deleteHomework = (req, res) => {
        const { id: _id } = req.params;
        const run = async () => {
            const [homework, homeworkError] = await handle(Homework.findOneAndDelete({ _id }));
            if (homeworkError) throw new Error(`Error deleting homework ${_id}`);
            res.send({ success: homework });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    getHomework = (req, res) => {
        const { id: studentId } = req.params;
        const run = async () => {
            const [homework, homeworkError] = await handle(Homework.find({ studentId }).sort({ date: 'desc' }));
            if (homeworkError) throw new Error(`Error finding homework for student ${studentId}`);
            res.send({ success: true, homework });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editHomework = (req, res) => {
        const { id: _id } = req.params;
        const { date, headline, assignments } = req.body;
        const run = async () => {
            let [homework, homeworkError] = await handle(Homework.findOne({ _id }));
            if (homeworkError) throw new Error(`Error finding homework ${_id}`);
            if (!homework) throw new Error(`Homework ${_id} not found`);
            homework = Object.assign(homework, { date, headline, assignments });
            const [success, saveError] = await handle(homework.save());
            if (saveError) throw new Error(`Error saving homework`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    updateProgress = (req, res) => {
        const { id: _id } = req.params;
        const { index, value } = req.body;
        const run = async () => {
            let [homework, homeworkError] = await handle(Homework.findOne({ _id }));
            if (homeworkError) throw new Error(`Error finding homework ${_id}`);
            if (!homework) throw new Error(`Homework ${_id} not found`);
            homework.assignments[index].progress = value;
            const [success, saveError] = await handle(homework.save());
            if (saveError) throw new Error(`Error saving homework`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    updateRecorded = (req, res) => {
        // todo maybe combine this one and update progress? difference is literally one line
        const { id: _id } = req.params;
        const { index, recorded } = req.body;
        const run = async () => {
            let [homework, homeworkError] = await handle(Homework.findOne({ _id }));
            if (homeworkError) throw new Error(`Error finding homework ${_id}`);
            if (!homework) throw new Error(`Homework ${_id} not found`);
            homework.assignments[index].recorded = recorded;
            const [success, saveError] = await handle(homework.save());
            if (saveError) throw new Error(`Error saving homework`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    updateCoins = (req, res) => {
        const { id: _id } = req.params;
        const { coins } = req.body;
        const run = async () => {
            let [student, studentError] = await handle(Student.findOne({ _id }));
            if (studentError) throw new Error(`Error finding student ${_id}`);
            if (!student) throw new Error(`Student ${_id} not found`);
            student = Object.assign(student, { coins });
            const [success, saveError] = await handle(student.save());
            if (saveError) throw new Error(`Error saving student`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    addWearable = (req, res) => {
        // todo validate name
        const { teacherCode, name, category, occupies, src, value, image } = req.body;
        const run = async () => {
            const [wearable, wearableError] = await handle(Wearable.create({
                teacherCode, name, category, occupies, src, value, image
            }));
            if (wearableError) throw new Error(`Error creating new wearable`);
            res.send({ success: wearable });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editWearable = (req, res) => {
        const { id: _id } = req.params;
        // todo validate name
        const { name, category, occupies, src, value, image } = req.body;
        const run = async () => {
            let [wearable, wearableError] = await handle(Wearable.findOne({ _id }));
            if (wearableError) throw new Error(`Error finding wearable ${_id}`);
            if (!wearable) throw new Error(`Wearable ${_id} not found`);
            wearable = Object.assign(wearable, { name, category, occupies, src, value, image });
            const [success, saveError] = await handle(wearable.save());
            if (saveError) throw new Error(`Error saving wearable`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    deleteWearable = (req, res) => {
        const { id: _id } = req.params;
        const run = async () => {
            const [wearable, wearableError] = await handle(Wearable.findOne({ _id }));
            if (wearableError) throw new Error(`Error finding wearable ${_id}`);
            if (!wearable) throw new Error(`Wearable ${_id} not found`);
            // loop through students in wearable.ownedBy and remove wearable._id from student.closet and student.avatar arrays
            const studentIds = wearable.ownedBy || [];
            const [students, studentsError] = await handle(Promise.all(studentIds.map(studentId => Student.findOne({ _id: studentId }))));
            if (studentsError) throw new Error(`Error retrieving students with this wearable`);
            // removeFromStudents will be an array of promises to spread out into upcoming Promise.all() along with wearable.deleteOne()
            const removeFromStudents = students.map(student => {
                const removeWearable = (id, arrays) => {
                    for (let array of arrays) {
                        const index = array.indexOf(id);
                        if (index !== -1) array.splice(index, 1);
                    }
                }
                removeWearable(_id, [student.closet, student.avatar]);
                return student.save();
            });
            const [success, error] = await handle(Promise.all([
                wearable.deleteOne(),
                ...removeFromStudents
            ]));
            if (error) throw new Error(`Error deleting wearable ${_id}`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    addBadge = (req, res) => {
        // todo validate name
        const { teacherCode, name, src, value } = req.body;
        const run = async () => {
            const [badge, badgeError] = await handle(Badge.create({ teacherCode, name, src, value }));
            if (badgeError) throw new Error(`Error creating new badge`);
            res.send({ success: badge });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editBadge = (req, res) => {
        const { id: _id } = req.params;
        // todo validate name
        const run = async () => {
            let [badge, badgeError] = await handle(Badge.findOne({ _id }));
            if (badgeError) throw new Error(`Error finding badge ${_id}`);
            if (!badge) throw new Error(`Badge ${_id} not found`);
            badge = Object.assign(badge, req.body);
            const [success, saveError] = await handle(badge.save());
            if (saveError) throw new Error(`Error saving badge`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    deleteBadge = (req, res) => {
        const { id: _id } = req.params;
        const run = async () => {
            const [badge, badgeError] = await handle(Badge.findOne({ _id }));
            if (badgeError) throw new Error(`Error finding badge ${_id}`);
            if (!badge) throw new Error(`Badge ${_id} not found`);
            const studentIds = badge.awardedTo || [];
            const [students, studentsError] = await handle(Promise.all(studentIds.map(studentId => Student.findOne({ _id: studentId }))));
            if (studentsError) throw new Error(`Error retrieving students with this badge`);
            const removeFromStudents = students.map(student => {
                const removeBadge = (id, array) => {
                    const index = array.findIndex(object => object.id === id);
                    if (index !== -1) array.splice(index, 1);
                }
                removeBadge(_id, student.badges);
                return student.save();
            });
            const [success, error] = await handle(Promise.all([
                badge.deleteOne(),
                ...removeFromStudents
            ]));
            if (error) throw new Error(`Error deleting badge ${_id}`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    addWearableCategory = (req, res) => {
        const { id: teacherCode } = req.params;
        // todo validate name - can't be duplicate, also can't be "Color" (case insensitive)
        const { categoryName } = req.body;
        const run = async () => {
            let [success, createError] = await handle(Category.create({
                name: categoryName,
                teacherCode
            }));
            if (createError) throw new Error(`Error creating new category`);
            res.send({ success: true, newCategory: success }); // todo correct this here and in Marketplace.js
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    editWearableCategory = (req, res) => {
        const { id: teacherCode } = req.params;
        const { _id, categoryName } = req.body;
        // todo validate name
        const run = async () => {
            let [category, categoryError] = await handle(Category.findOne({ _id }));
            if (categoryError) throw new Error(`Error finding category ${_id}`);
            if (!category) throw new Error(`Category ${_id} not found`);
            category = Object.assign(category, { name: categoryName });
            const [success, saveError] = await handle(category.save());
            if (saveError) throw new Error(`Error saving category`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    deleteWearableCategory = (req, res) => {
        const { id: teacherCode } = req.params;
        const { _id, newCategory } = req.body;
        const run = async () => {
            let [category, categoryError] = await handle(Category.findOneAndDelete({ _id }));
            if (categoryError) throw new Error(`Error deleting category ${_id}`);
            if (!category) throw new Error(`Category ${_id} not found`);
            let [wearables, wearablesError] = await handle(Wearable.updateMany({ category: _id }, { category: newCategory }));
            if (wearablesError) throw new Error(`Error updating wearables`);
            res.send({ success: { category, wearables } });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    updateBadges = (req, res) => {
        const { id: _id } = req.params;
        const { badgeId } = req.body;
        const run = async () => {
            const [student, studentError] = await handle(Student.findOne({ _id }));
            if (studentError) throw new Error(`Error finding student ${_id}`);
            if (!student) throw new Error(`Student ${_id} not found`);
            const alreadyHasBadge = (() => {
                if (!student.badges || !student.badges.length) return false;
                const index = student.badges.findIndex(object => object.id === badgeId);
                if (index === -1) return false;
                return true;
            })();
            if (alreadyHasBadge) throw new Error(`This student has already been awarded this badge`);
            const newBadge = { id: badgeId, redeemed: false };
            if (!student.badges) student.badges = [];
            student.badges.push(newBadge);
            const [success, saveError] = await handle(student.save());
            if (saveError) throw new Error(`Error saving student ${_id}`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    updateBadgeRedeemed = (req, res) => {
        const { id: _id } = req.params;
        const { badgeId, badgeValue } = req.body;
        const run = async () => {
            let [student, studentError] = await handle(Student.findOne({ _id }));
            if (studentError) throw new Error(`Error finding student ${_id}`);
            if (!student) throw new Error(`Student ${_id} not found`);
            const index = student.badges.findIndex(object => object.id === badgeId);
            const studentHasBadge = index !== -1;
            if (!studentHasBadge) throw new Error(`Student doesn't have this badge`);
            student.badges[index].redeemed = true;
            student.coins += badgeValue;
            const [success, saveError] = await handle(student.save());
            if (saveError) throw new Error(`Error saving student`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    updateCloset = (req, res) => {
        const { id: _id } = req.params;
        const { wearableId, wearableCost } = req.body;
        const run = async () => {
            let [student, studentError] = await handle(Student.findOne({ _id }));
            if (studentError) throw new Error(`Error finding student ${_id}`);
            if (!student) throw new Error(`Student ${_id} not found`);
            if (!student.closet) student.closet = [wearableId];
            if (student.closet.includes(wearableId))
                throw new Error(`Student already owns this wearable`);
            student.closet.push(wearableId);
            student.coins -= wearableCost;
            const [success, saveError] = await handle(student.save());
            if (saveError) throw new Error(`Error saving student`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    updateAvatar = (req, res) => {
        const { id: _id } = req.params;
        const { avatar } = req.body;
        const run = async () => {
            let [student, studentError] = await handle(Student.findOne({ _id }));
            if (studentError) throw new Error(`Error finding student ${_id}`);
            if (!student) throw new Error(`Student ${_id} not found`);
            student = Object.assign(student, { avatar });
            const [success, saveError] = await handle(student.save());
            if (saveError) throw new Error(`Error saving student`);
            res.send({ success });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
}

export default new Controller();