import Controller from '../controllers/index.js';
import { validate } from '../middleware/index.js';

export default function (app) {
    app.post('/custom', Controller.custom);

    // COMMON
    app.get('/auth', Controller.auth);
    app.post('/login', Controller.login);
    app.get('/logout', Controller.logout);

    // TEACHER
    app.route('/teacher')
        .post(validate.teacherSignup, Controller.teacherSignup);
    app.route('/teacherCode/:teacherCode')
        .get(Controller.validateTeacherCode);
    app.route('/teacher/:id')
        .get(Controller.getTeacher)
        .put(Controller.editAccount);
    app.route('/teacher/:id/password')
        .put(Controller.editPassword);
    app.route('/teacher/:id/wearable-category') // todo fix route name hierarchy
        .post(Controller.addWearableCategory)
        .put(Controller.editWearableCategory)
        .delete(Controller.deleteWearableCategory);
    app.route('/wearable')
        .post(Controller.addWearable);
    app.route('/wearable/:id')
        .put(Controller.editWearable)
        .delete(Controller.deleteWearable);
    app.route('/badge')
        .post(Controller.addBadge);
    app.route('/badge/:id')
        .put(Controller.editBadge)
        .delete(Controller.deleteBadge);
    
    // STUDENT
    app.post('/student', validate.studentSignup, Controller.studentSignup);
    app.route('/student/:id')
        .put(Controller.editAccount);
    app.route('/student/:id/password')
        .put(Controller.editPassword);
    app.route('/student/:id/homework')
        .get(Controller.getHomework)
        .post(Controller.addHomework);
    app.route('/student/homework/:id')
        .put(Controller.editHomework)
        .delete(Controller.deleteHomework);
    app.put('/assignment/:id/progress', Controller.updateProgress);
    app.put('/assignment/:id/recorded', Controller.updateRecorded);
    app.put('/student/:id/coins', Controller.updateCoins);
    app.put('/student/:id/badges', Controller.updateBadges);
    app.route('/student/:id/badge/redeemed')
        .put(Controller.updateBadgeRedeemed);
    app.put('/student/:id/closet', Controller.updateCloset);
    app.put('/student/:id/avatar', Controller.updateAvatar);
}