const controller = require('../controllers/index');
const { validate } = require('../middleware');

module.exports = (app) => {

    app.post('/custom', controller.custom);

    // COMMON
    app.get('/auth', controller.auth);
    app.post('/login', controller.login);
    app.get('/logout', controller.logout);

    // TEACHER
    app.post('/teacher', validate.teacherSignup, controller.teacherSignup);
    app.get('/teacher/:id/data', controller.getTeacherData);
    app.route('/wearable')
        .post(controller.addWearable);
    app.route('/wearable/:id')
        .put(controller.editWearable)
        .delete(controller.deleteWearable);
    app.route('/badge')
        .post(controller.addBadge);
    app.route('/badge/:id')
        .put(controller.editBadge)
        .delete(controller.deleteBadge);
    app.route('/teacher/:id/wearable-category')
        .post(controller.addWearableCategory)
        .put(controller.editWearableCategory);
    
    // STUDENT
    app.post('/student', validate.studentSignup, controller.studentSignup);
    app.route('/student/:id/homework')
        .get(controller.getHomework)
        .post(controller.addHomework);
    app.route('/student/homework/:id')
        .put(controller.editHomework)
        .delete(controller.deleteHomework);
    app.put('/student/homework/assignment/:id/progress', controller.updateProgress);
    app.put('/student/homework/assignment/:id/recorded', controller.updateRecorded);
    app.put('/student/:id/coins', controller.updateCoins);
    app.put('/student/:id/closet', controller.updateCloset);
    app.put('/student/:id/avatar', controller.updateAvatar);
}