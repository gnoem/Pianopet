import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { handle, FormError, ServerError, formErrorReport } from './utils.js';
import { Student, Teacher, Homework, Wearable, Category, Badge } from '../models/index.js';

const secretKey = process.env.SECRET_KEY;

/*
patterns:
- run().catch(err)
- simple update resource: Document.findOne({ _id }) then document = Object.assign(document, data);
- update array - e.g. student.badges.findIndex(callback) then student.badges[index] = someValue;
    but throw error if index === -1
*/

const validationErrorReport = (errors) => {
    const report = errors.reduce((obj, error) => {
        if (error.location !== 'body') return null;
        obj[error.param] = error.msg;
        return obj;
    }, {});
    return report;
}

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
            if (teacherError) throw new Error(`Error finding teacher ${teacherCode}`);
            if (!teacher) throw new Error(`Teacher ${teacherCode} not found`);
            res.send({ success: true, teacher });
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
    
    getHomework = (req, res) => {
        const { id: studentId } = req.params;
        const run = async () => {
            const [homework, homeworkError] = await handle(Homework.find({ studentId }).sort({ date: 'desc' }));
            if (homeworkError) throw new ServerError(500, `Error finding homework for student`, homeworkError);
            res.status(200).send({ homework });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
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
        const { _id } = req.params;
        const { index, value } = req.body;
        const run = async () => {
            let [foundHomework, findHomeworkError] = await handle(Homework.findOne({ _id }));
            if (findHomeworkError) throw new ServerError(500, `Error finding homework`, findHomeworkError);
            if (!foundHomework) throw new ServerError(500, `Homework not found`);
            foundHomework.assignments[index].progress = value;
            const [homework, saveError] = await handle(foundHomework.save());
            if (saveError) throw new ServerError(500, `Error saving homework`, saveError);
            res.send({ homework });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
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
    
    // these have been updated
    createWearable = (req, res) => {
        const formData = req.body;
        const run = async () => {
            const [wearable, createWearableError] = await handle(Wearable.create(formData));
            if (createWearableError) throw new ServerError(500, `Error creating new wearable`, createWearableError);
            res.status(201).send({ wearable });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editWearable = (req, res) => {
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


    
    addBadge = (req, res) => {
        // todo validate name
        const { teacherCode, name, src, value } = req.body;
        const run = async () => {
            const [badge, createBadgeError] = await handle(Badge.create({ teacherCode, name, src, value }));
            if (createBadgeError) throw new ServerError(500, `Error creating new badge`, createBadgeError);
            res.status(201).send({ badge });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editBadge = (req, res) => {
        const { id: _id } = req.params;
        // todo validate name
        const run = async () => {
            let [foundBadge, findBadgeError] = await handle(Badge.findOne({ _id }));
            if (findBadgeError) throw new ServerError(500, `Error finding badge`, findBadgeError);
            if (!foundBadge) throw new ServerError(500, `Badge not found`);
            foundBadge = Object.assign(foundBadge, req.body);
            const [badge, saveError] = await handle(foundBadge.save());
            if (saveError) throw new ServerError(500, `Error saving badge`, saveError);
            res.status(200).send({ badge });
        }
        run().catch(err => res.send({ success: false, error: err.message }));
    }
    deleteBadge = (req, res) => {
        const { id: _id } = req.params;
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
    

    // these are all good
    createCategory = (req, res) => {
        const { teacherCode, name } = req.body;
        // todo validate name
        const run = async () => {
            const [category, createCategoryError] = await handle(Category.create({ teacherCode, name }));
            if (createCategoryError) throw new ServerError(500, `Error creating new category`, createCategoryError);
            res.status(201).send({ category });
        }
        run().catch(({ status, message, error }) => res.status(status ?? 500).send({ message, error }));
    }
    editCategory = (req, res) => {
        // todo validate name
        const { _id } = req.params;
        const { name } = req.body;
        console.log(name);
        const run = async () => {
            let [foundCategory, findCategoryError] = await handle(Category.findOne({ _id }));
            if (findCategoryError) throw new ServerError(500, `Error finding category`, findCategoryError);
            if (!foundCategory) throw new ServerError(500, `Category not found`);
            foundCategory = Object.assign(foundCategory, { name });
            const [category, saveError] = await handle(foundCategory.save());
            if (saveError) throw new ServerError(500, `Error saving category`, saveError);
            res.send({ category });
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
    

    // these are no good
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
            let [allWearables, findWearablesError] = await handle(Wearable.find({ teacherCode }));
            if (findWearablesError) throw new Error(`Error finding wearables with the teacherCode ${teacherCode}`);
            let wearablesReassigned = [];
            if (newCategory) {
                const [reassignWearables, reassignWearablesError] = await handle(Wearable.updateMany({ category: _id }, { category: newCategory }));
                if (reassignWearablesError) throw new Error(`Error reassigning wearables to new category`);
                wearablesReassigned = reassignWearables;
            }
            const updateWearableOccupies = allWearables.map(wearable => {
                const index = wearable.occupies.indexOf(_id);
                if (index !== -1) {
                    wearable.occupies.splice(index, 1);
                    return wearable.save();
                }
            });
            const [updateWearables, updateError] = await handle(Promise.all(updateWearableOccupies));
            if (updateError) throw new Error(`Error updating wearables`);
            res.send({ success: { category, wearablesReassigned, wearablesUpdated: updateWearables } });
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
            const [badge, findBadgeError] = await handle(Badge.findOne({ _id: badgeId }));
            if (findBadgeError) throw new Error(`Error finding badge ${badgeId}`);
            const updateAwardedTo = () => {
                if (!badge.awardedTo) badge.awardedTo = [];
                const index = badge.awardedTo.indexOf(_id);
                if (index === -1) badge.awardedTo.push(_id);
            }
            updateAwardedTo();
            const [success, saveError] = await handle(Promise.all([student.save(), badge.save()]));
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
            if (student.closet.includes(wearableId)) throw new Error(`Student already owns this wearable`);
            student.closet.push(wearableId);
            student.coins -= wearableCost;
            const [wearable, findWearableError] = await handle(Wearable.findOne({ _id: wearableId }));
            if (findWearableError) throw new Error(`Error finding wearable`);
            if (!wearable) throw new Error(`Wearable not found`);
            const addStudentIdToWearable = () => {
                if (!wearable.ownedBy) wearable.ownedBy = [];
                const index = wearable.ownedBy.indexOf(_id);
                if (index === -1) wearable.ownedBy.push(_id);
            }
            addStudentIdToWearable();
            const [success, saveError] = await handle(Promise.all([student.save(), wearable.save()]));
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