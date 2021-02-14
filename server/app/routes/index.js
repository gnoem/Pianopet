const controller = require('../controllers/index');
const { validate } = require('../middleware');

module.exports = (app) => {
    app.get('/auth', controller.auth);
    app.get('/logout', controller.logout);
    app.post('/student/login', controller.studentLogin);
    app.post('/student/signup', validate.studentSignup, (req, res) => controller.studentSignup(req, res));
    app.post('/teacher/login', controller.teacherLogin);
    app.post('/teacher/signup', validate.teacherSignup, controller.teacherSignup);
    app.post('/teacher/data', controller.getTeacherData);
    app.get('/get/students/:id', controller.getStudents);
    app.post('/add/homework', controller.addHomework);
    app.post('/delete/homework', controller.deleteHomework);
    app.post('/get/homework', controller.getHomework);
    app.post('/edit/homework', controller.editHomework);
    app.post('/update/progress', controller.updateProgress);
    app.post('/update/recorded', controller.updateRecorded);
    app.post('/update/coins', controller.updateCoins);
    app.post('/add/wearable', controller.addWearable);
    app.post('/edit/wearable', controller.editWearable);
    app.post('/delete/wearable', controller.deleteWearable);
    app.post('/add/badge', controller.addBadge);
    app.post('/edit/badge', controller.editBadge);
    app.post('/delete/badge', controller.deleteBadge);
    app.post('/add/wearableCategory', controller.addWearableCategory);
    app.post('/edit/wearableCategory', controller.editWearableCategory);
    app.post('/buy/wearable', controller.buyWearable);
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