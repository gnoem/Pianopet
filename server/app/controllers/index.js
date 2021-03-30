import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { handle, ServerError, validationErrorReport } from './utils.js';
import { Student, Teacher, Homework, Wearable, Category, Badge } from '../models/index.js';

const secretKey = process.env.SECRET_KEY;

class Controller {
    custom = () => {
        console.log('hi')
    }
    auth = (req, res) => {
        const accessToken = req.cookies?.auth;
        if (!accessToken) return res.status(401).send({ token: false });
        const decoded = jwt.verify(accessToken, secretKey);
        const run = async () => {
            const [student, studentError] = await handle(Student.findOne({ _id: decoded.id }));
            if (studentError) throw new ServerError(500, `Error finding user ${_id}`, studentError);
            if (student) return res.status(200).send({ token: true, isStudent: true, _id: student._id });
            const [teacher, teacherError] = await handle(Teacher.findOne({ _id: decoded.id }));
            if (teacherError) throw new ServerError(500, `Error finding user ${_id}`, teacherError);
            if (!teacher) throw new ServerError(500, `User ${_id} not found`); // and delete cookie? todo figure out
            res.status(200).send({ token: true, isStudent: false, _id: teacher._id });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    getUser = (req, res) => {
        const { _id } = req.params;
        const run = async () => {
            const [student, studentError] = await handle(Student.findOne({ _id }));
            if (studentError) throw new ServerError(500, `Error finding user`, studentError);
            if (student) return this.getStudent(res, student); // todo figure out if better way to res.send than passing res
            const [teacher, teacherError] = await handle(Teacher.findOne({ _id }));
            if (teacherError) throw new ServerError(500, `Error finding user`, teacherError);
            if (!teacher) throw new ServerError(500, `User not found`); // and delete cookie? todo figure out
            this.getTeacher(res, teacher);
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
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
            if (dataError) throw new ServerError(500, `Error retrieving data associated with teacher ${teacherCode}`, dataError);
            if (!foundData) throw new ServerError(500, `Could not find any data associated with teacher ${teacherCode}`);
            const [teacher, wearables, categories, badges] = foundData;
            const studentData = { isStudent: true, student, teacher, wearables, categories, badges };
            res.status(200).send(studentData);
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
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
            if (dataError) throw new ServerError(500, `Error retrieving data for teacher ${teacherCode}`, dataError);
            if (!foundData) throw new ServerError(500, `Could not find any data associated with teacher ${teacherCode}`);
            const [students, wearables, categories, badges] = foundData;
            const teacherData = { isStudent: false, teacher, students, wearables, categories, badges };
            res.status(200).send(teacherData);
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    
    login = (req, res) => {
        const { role, username, password } = req.body;
        const isStudent = role === 'student';
        const run = async () => {
            const User = isStudent ? Student : Teacher;
            const [user, userError] = await handle(User.findOne({ username }));
            if (userError) throw new ServerError(500, `Error finding ${role} ${username}`, userError);
            if (!user) return res.status(422).send({ error: { username: 'User not found' } });
            const passwordIsValid = bcrypt.compareSync(password, user.password);
            if (!passwordIsValid) return res.status(422).send({ error: { password: 'Invalid password' } });
            const accessToken = jwt.sign({ id: user.id }, secretKey, {
                expiresIn: 86400 // 24 hours
            });
            res.cookie('auth', accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000 // 1,000 hours
            });
            res.status(200).send({ user, isStudent });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    logout = (req, res) => {
        res.clearCookie('auth');
        res.redirect('/');
    }
    
    studentSignup = (req, res) => {
        const { firstName, lastName, email, username, password, teacherCode } = req.body;
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: validationErrorReport(errors) });
        const run = async () => {
            const [student, studentError] = await handle(Student.create({
                firstName,
                lastName,
                email,
                username,
                password: bcrypt.hashSync(password, 8),
                teacherCode
            }));
            if (studentError) throw new ServerError(500, `Error creating new student`, studentError);
            const accessToken = jwt.sign({ id: student.id }, secretKey, {
                expiresIn: 86400 // 24 hours
            });
            res.cookie('auth', accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000 // 1,000 hours
            });
            res.status(201).send({ user: student, isStudent: true });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    teacherSignup = (req, res) => {
        const { firstName, lastName, email, username, password } = req.body;
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: validationErrorReport(errors) });
        const run = async () => {
            const [teacher, teacherError] = await handle(Teacher.create({
                firstName,
                lastName,
                email,
                username,
                password: bcrypt.hashSync(password, 8)
            }));
            if (teacherError) throw new ServerError(500, `Error creating new teacher`, teacherError);
            const accessToken = jwt.sign({ id: teacher.id }, secretKey, {
                expiresIn: 86400 // 24 hours
            });
            res.cookie('auth', accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000 // 1,000 hours
            });
            res.status(201).send({ user: teacher, isStudent: false });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    validateTeacherCode = (req, res) => {
        const { teacherCode } = req.params;
        const run = async () => {
            const [teacher, teacherError] = await handle(Teacher.findOne({ _id: teacherCode }));
            if (teacherError) throw new ServerError(500, `Error finding teacher ${teacherCode}`);
            if (!teacher) throw new ServerError(500, `Teacher ${teacherCode} not found`);
            res.send({ success: true, teacher });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editAccount = (req, res) => {
        const { _id } = req.params;
        const { role, firstName, lastName, username, email, profilePic } = req.body;
        const run = async () => {
            const User = role === 'student' ? Student : Teacher;
            let [user, userError] = await handle(User.findOne({ _id }));
            if (userError) throw new ServerError(500, `Error finding user ${_id}`);
            if (!user) throw new ServerError(500, `User ${_id} not found`);
            user = Object.assign(user, { firstName, lastName, username, email, profilePic });
            const [success, saveError] = await handle(user.save());
            if (saveError) throw new ServerError(500, `Error saving user ${_id}`);
            res.status(200).send({ success });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editPassword = (req, res) => {
        const { _id } = req.params;
        const { role, newPassword } = req.body;
        const run = async () => {
            const User = role === 'student' ? Student : Teacher;
            let [user, userError] = await handle(User.findOne({ _id }));
            if (userError) throw new ServerError(500, `Error finding user ${_id}`);
            if (!user) throw new ServerError(500, `User ${_id} not found`);
            user = Object.assign(user, { password: bcrypt.hashSync(newPassword, 8) });
            const [success, saveError] = await handle(user.save());
            if (saveError) throw new ServerError(500, `Error saving user ${_id}`);
            res.status(200).send({ success });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    
    getHomework = (req, res) => {
        const { _id: studentId } = req.params;
        const run = async () => {
            const [homework, homeworkError] = await handle(Homework.find({ studentId }).sort({ date: 'desc' }));
            if (homeworkError) throw new ServerError(500, `Error finding homework for student`, homeworkError);
            res.status(200).send({ homework });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    createHomework = (req, res) => {
        const { _id: studentId } = req.body;
        const run = async () => {
            const [homework, homeworkError] = await handle(Homework.create({ studentId, ...req.body }));
            if (homeworkError) throw new ServerError(500, `Error creating new homework`, homeworkError);
            res.status(201).send({ homework });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editHomework = (req, res) => {
        const { _id, action } = req.params;
        const run = async () => {
            const [foundHomework, findHomeworkError] = await handle(Homework.findOne({ _id }));
            if (findHomeworkError) throw new ServerError(500, `Error finding homework`, findHomeworkError);
            if (!foundHomework) throw new ServerError(500, `Homework not found`);
            const dispatch = (() => {
                switch (action) {
                    case 'content': return this.updateHomeworkContent;
                    case 'progress': return this.updateHomeworkProgress;
                    case 'recorded': return this.updateHomeworkRecorded;
                    default: throw new ServerError(500, `Invalid action: ${action}`);
                }
            })();
            const [editedHomework, editHomeworkError] = await handle(dispatch(foundHomework, req.body));
            if (editHomeworkError) throw new ServerError(500, `Dispatch error for ${action}`, editHomeworkError);
            const [homework, saveError] = await handle(editedHomework.save());
            if (saveError) throw new ServerError(500, `Error saving homework`, saveError);
            res.status(200).send({ homework });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    updateHomeworkContent = (homework, content) => {
        return Object.assign(homework, content);
    }
    updateHomeworkProgress = (homework, { index, value }) => {
        homework.assignments[index].progress = value;
        return homework;
    }
    updateHomeworkRecorded = (homework, { index, recorded }) => {
        homework.assignments[index].recorded = recorded;
        return homework;
    }
    deleteHomework = (req, res) => {
        const { _id } = req.params;
        const run = async () => {
            const [homework, homeworkError] = await handle(Homework.findOneAndDelete({ _id }));
            if (homeworkError) throw new ServerError(500, `Error deleting homework`, homeworkError);
            res.status(200).send({ homework });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    
    createWearable = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: validationErrorReport(errors) });
        const formData = req.body;
        const run = async () => {
            const [wearable, createWearableError] = await handle(Wearable.create(formData));
            if (createWearableError) throw new ServerError(500, `Error creating new wearable`, createWearableError);
            res.status(201).send({ wearable });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editWearable = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: validationErrorReport(errors) });
        const { _id } = req.params;
        const formData = req.body;
        const run = async () => {
            let [foundWearable, findWearableError] = await handle(Wearable.findOne({ _id }));
            if (findWearableError) throw new ServerError(500, `Error finding wearable`, findWearableError);
            if (!foundWearable) throw new ServerError(500, `Wearable not found`);
            foundWearable = Object.assign(foundWearable, formData);
            const [wearable, saveWearableError] = await handle(foundWearable.save());
            if (saveWearableError) throw new ServerError(500, `Error saving wearable`, saveWearableError);
            res.status(200).send({ wearable });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    deleteWearable = (req, res) => {
        const { _id } = req.params;
        const run = async () => {
            const [wearable, wearableError] = await handle(Wearable.findOne({ _id }));
            if (wearableError) throw new ServerError(500, `Error finding wearable`, wearableError);
            if (!wearable) throw new ServerError(500, `Wearable not found`);
            // loop through students in wearable.ownedBy and remove wearable._id from student.closet and student.avatar arrays
            const studentIds = wearable.ownedBy || [];
            const [students, studentsError] = await handle(Promise.all(studentIds.map(studentId => Student.findOne({ _id: studentId }))));
            if (studentsError) throw new ServerError(500, `Error retrieving students with this wearable`, studentsError);
            // removeFromStudents will be an array of promises to spread out into upcoming Promise.all() along with wearable.deleteOne()
            const removeFromStudents = students.map(student => {
                const removeWearable = (id, array) => {
                    const index = array.indexOf(id);
                    if (index !== -1) array.splice(index, 1);
                }
                removeWearable(_id, student.closet);
                removeWearable(_id, student.avatar);
                return student.save();
            });
            const [_, error] = await handle(Promise.all([
                wearable.deleteOne(),
                ...removeFromStudents
            ]));
            if (error) throw new ServerError(500, `Error deleting wearable`, error);
            res.status(204).end();
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    
    createCategory = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: validationErrorReport(errors) });
        const { teacherCode, name } = req.body;
        const run = async () => {
            const [category, createCategoryError] = await handle(Category.create({ teacherCode, name }));
            if (createCategoryError) throw new ServerError(500, `Error creating new category`, createCategoryError);
            res.status(201).send({ category });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editCategory = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: validationErrorReport(errors) });
        const { _id } = req.params;
        const { name } = req.body;
        const run = async () => {
            let [foundCategory, findCategoryError] = await handle(Category.findOne({ _id }));
            if (findCategoryError) throw new ServerError(500, `Error finding category`, findCategoryError);
            if (!foundCategory) throw new ServerError(500, `Category not found`);
            foundCategory = Object.assign(foundCategory, { name });
            const [category, saveError] = await handle(foundCategory.save());
            if (saveError) throw new ServerError(500, `Error saving category`, saveError);
            res.status(200).send({ category });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    deleteCategory = (req, res) => {
        const { _id } = req.params;
        const { teacherCode, newCategory } = req.body;
        const run = async () => {
            let [foundCategory, findCategoryError] = await handle(Category.findOne({ _id }));
            if (findCategoryError) throw new ServerError(500, `Error finding category`);
            if (!foundCategory) throw new ServerError(500, `Category not found`);
             // if there exist wearables in this category, reassign those wearables to specified new category
            const [foundWearables, findWearablesToReassignError] = await handle(Wearable.find({ category: _id }));
            if (findWearablesToReassignError) throw new ServerError(500, `Error finding wearables to new category`, findWearablesToReassignError);
            const reassignWearables = foundWearables.map(wearable => {
                wearable.category = newCategory;
                return wearable.save();
            });
            // remove category id from all wearables whose 'occupies regions' array includes it
            let [allWearables, findWearablesError] = await handle(Wearable.find({ teacherCode }));
            if (findWearablesError) throw new ServerError(500, `Error finding wearables with the teacherCode ${teacherCode}`);
            const updateWearableOccupies = allWearables.map(wearable => {
                const index = wearable.occupies.indexOf(_id);
                if (index !== -1) {
                    wearable.occupies.splice(index, 1);
                    return wearable.save();
                }
            });
            const [success, updateError] = await handle(Promise.all([
                foundCategory.deleteOne(),
                ...reassignWearables,
                ...updateWearableOccupies
            ]));
            if (updateError) throw new ServerError(500, `Error updating wearables`, updateError);
            const [category, reassignedWearables, updatedWearableOccupies] = success;
            res.status(200).send({ category, reassignedWearables, updatedWearableOccupies });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    
    addBadge = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: validationErrorReport(errors) });
        const { teacherCode, name, src, value } = req.body;
        const run = async () => {
            const [badge, createBadgeError] = await handle(Badge.create({ teacherCode, name, src, value }));
            if (createBadgeError) throw new ServerError(500, `Error creating new badge`, createBadgeError);
            res.status(201).send({ badge });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editBadge = (req, res) => {
        const { errors } = validationResult(req);
        if (errors.length) return res.status(422).send({ error: validationErrorReport(errors) });
        const { _id } = req.params;
        const run = async () => {
            let [foundBadge, findBadgeError] = await handle(Badge.findOne({ _id }));
            if (findBadgeError) throw new ServerError(500, `Error finding badge`, findBadgeError);
            if (!foundBadge) throw new ServerError(500, `Badge not found`);
            foundBadge = Object.assign(foundBadge, req.body);
            const [badge, saveError] = await handle(foundBadge.save());
            if (saveError) throw new ServerError(500, `Error saving badge`, saveError);
            res.status(200).send({ badge });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    deleteBadge = (req, res) => {
        const { _id } = req.params;
        const run = async () => {
            const [foundBadge, findBadgeError] = await handle(Badge.findOne({ _id }));
            if (findBadgeError) throw new ServerError(500, `Error finding badge`, findBadgeError);
            if (!foundBadge) throw new ServerError(500, `Badge not found`);
            const studentIds = foundBadge.awardedTo || [];
            const [students, studentsError] = await handle(Promise.all(studentIds.map(studentId => Student.findOne({ _id: studentId }))));
            if (studentsError) throw new ServerError(500, `Error retrieving students with this badge`, studentsError);
            const removeFromStudents = students.map(student => {
                const removeBadge = (id, array) => {
                    const index = array.findIndex(object => object.id === id);
                    if (index !== -1) array.splice(index, 1);
                }
                removeBadge(_id, student.badges);
                return student.save();
            });
            const [success, error] = await handle(Promise.all([
                foundBadge.deleteOne(),
                ...removeFromStudents
            ]));
            if (error) throw new ServerError(500, `Error deleting badge`, error);
            const [badge, updatedStudents] = success;
            res.status(200).send({ badge, updatedStudents });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    
    updateCoins = (req, res) => {
        const { _id } = req.params;
        const { coins } = req.body;
        const run = async () => {
            let [foundStudent, findStudentError] = await handle(Student.findOne({ _id }));
            if (findStudentError) throw new ServerError(500, `Error finding student`, findStudentError);
            if (!foundStudent) throw new ServerError(500, `Student ${_id} not found`);
            foundStudent = Object.assign(foundStudent, { coins });
            const [student, saveError] = await handle(foundStudent.save());
            if (saveError) throw new ServerError(500, `Error saving student`, saveError);
            res.status(200).send({ student });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    updateBadges = (req, res) => {
        const { _id } = req.params;
        const { badgeId } = req.body;
        const run = async () => {
            const [foundStudent, findStudentError] = await handle(Student.findOne({ _id }));
            if (findStudentError) throw new ServerError(500, `Error finding student`, findStudentError);
            if (!foundStudent) throw new ServerError(500, `Student not found`);
            const alreadyHasBadge = (() => {
                if (!foundStudent.badges || !foundStudent.badges.length) return false;
                const index = foundStudent.badges.findIndex(object => object.id === badgeId);
                if (index === -1) return false;
                return true;
            })();
            if (alreadyHasBadge) return res.status(422).send({ error: { student: "Student already has this badge" } })
            const newBadge = { id: badgeId, redeemed: false };
            if (!foundStudent.badges) foundStudent.badges = [];
            foundStudent.badges.push(newBadge);
            const [foundBadge, findBadgeError] = await handle(Badge.findOne({ _id: badgeId }));
            if (findBadgeError) throw new ServerError(500, `Error finding badge ${badgeId}`);
            const updateAwardedTo = () => {
                if (!foundBadge.awardedTo) foundBadge.awardedTo = [];
                const index = foundBadge.awardedTo.indexOf(_id);
                if (index === -1) foundBadge.awardedTo.push(_id);
            }
            updateAwardedTo();
            const [success, saveError] = await handle(Promise.all([
                foundStudent.save(),
                foundBadge.save()
            ]));
            if (saveError) throw new ServerError(500, `Error saving student`, saveError);
            res.status(200).send({ success });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    updateBadgeRedeemed = (req, res) => {
        const { _id } = req.params;
        const { _id: badgeId, value: badgeValue } = req.body;
        const run = async () => {
            let [foundStudent, findStudentError] = await handle(Student.findOne({ _id }));
            if (findStudentError) throw new ServerError(500, `Error finding student`, findStudentError);
            if (!foundStudent) throw new ServerError(500, `Student not found`);
            const index = foundStudent.badges.findIndex(object => object.id === badgeId);
            const studentHasBadge = index !== -1;
            if (!studentHasBadge) throw new ServerError(500, `Student doesn't have this badge`); // todo figure out better
            foundStudent.badges[index].redeemed = true;
            foundStudent.coins += badgeValue;
            const [student, saveError] = await handle(foundStudent.save());
            if (saveError) throw new ServerError(500, `Error saving student`, saveError);
            res.status(200).send({ student });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    updateCloset = (req, res) => {
        const { _id } = req.params;
        const { wearableId, wearableCost } = req.body;
        const run = async () => {
            let [foundStudent, findStudentError] = await handle(Student.findOne({ _id }));
            if (findStudentError) throw new ServerError(500, `Error finding student`, findStudentError);
            if (!foundStudent) throw new ServerError(500, `Student not found`);
            if (!foundStudent.closet) {
                foundStudent.closet = [wearableId];
            }
            else {
                if (foundStudent.closet.includes(wearableId)) throw new ServerError(500, `Student already owns this wearable`); // todo handle better
                foundStudent.closet.push(wearableId);
            }
            foundStudent.coins -= wearableCost;
            const [foundWearable, findWearableError] = await handle(Wearable.findOne({ _id: wearableId }));
            if (findWearableError) throw new ServerError(500, `Error finding wearable`, findWearableError);
            if (!foundWearable) throw new ServerError(500, `Wearable not found`);
            const addStudentIdToWearable = () => {
                if (!foundWearable.ownedBy) foundWearable.ownedBy = [];
                const index = foundWearable.ownedBy.indexOf(_id);
                if (index === -1) foundWearable.ownedBy.push(_id);
            }
            addStudentIdToWearable();
            const [success, saveError] = await handle(Promise.all([
                foundStudent.save(),
                foundWearable.save()
            ]));
            if (saveError) throw new ServerError(500, `Error saving student`, saveError);
            res.status(200).send({ success });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    updateAvatar = (req, res) => {
        const { _id } = req.params;
        const { avatar } = req.body;
        const run = async () => {
            let [foundStudent, findStudentError] = await handle(Student.findOne({ _id }));
            if (findStudentError) throw new ServerError(500, `Error finding student`, findStudentError);
            if (!foundStudent) throw new ServerError(500, `Student not found`);
            foundStudent = Object.assign(foundStudent, { avatar });
            const [student, saveError] = await handle(foundStudent.save());
            if (saveError) throw new ServerError(500, `Error saving student`, saveError);
            res.status(200).send({ student });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
}

export default new Controller();