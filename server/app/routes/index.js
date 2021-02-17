const controller = require('../controllers/index');
const { validate } = require('../middleware');

module.exports = (app) => {
    app.get('/auth', controller.auth);
    app.get('/logout', controller.logout);
    app.post('/student/login', controller.studentLogin);
    app.post('/student/signup', validate.studentSignup, controller.studentSignup);
    app.post('/teacher/login', controller.teacherLogin);
    app.post('/teacher/signup', validate.teacherSignup, controller.teacherSignup);
    app.get('/teacher/:id/data', controller.getTeacherData);
    app.post('/homework', controller.addHomework);
    app.delete('/homework/:id', controller.deleteHomework);
    app.get('/student/:id/homework', controller.getHomework);
    app.put('/homework/:id', controller.editHomework);
    app.put('/assignment/:id/progress', controller.updateProgress);
    app.put('/assignment/:id/recorded', controller.updateRecorded);
    app.put('/coins/:id', controller.updateCoins);
    app.post('/wearable', controller.addWearable);
    app.put('/wearable/:id', controller.editWearable);
    app.delete('/wearable/:id', controller.deleteWearable);
    app.post('/badge', controller.addBadge);
    app.put('/badge/:id', controller.editBadge);
    app.delete('/badge/:id', controller.deleteBadge);
    app.post('/wearable-category', controller.addWearableCategory);
    app.put('/teacher/:id/wearable-category', controller.editWearableCategory);
    app.put('/student/:id/closet', controller.updateCloset);
    app.put('/student/:id/avatar', controller.updateAvatar);
}