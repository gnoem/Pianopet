import Controller from '../controllers/index.js';
import { validate } from '../middleware/index.js';

export default function (app) {
    app.post('/custom', Controller.custom);

    // COMMON
    app.post('/auth', Controller.auth);
    app.get('/data/:_id', Controller.getUser);
    app.post('/login', Controller.login);
    app.get('/logout', Controller.logout);

    app.route('/homework')
        .post(Controller.createHomework);
    app.route('/homework/:_id/:action')
        .put(Controller.editHomework);
    app.route('/homework/:_id')
        .delete(Controller.deleteHomework);
    app.route('/wearable')
        .post(validate.wearable, Controller.createWearable);
    app.route('/wearable/:_id')
        .put(validate.wearable, Controller.editWearable)
        .delete(Controller.deleteWearable);
    app.route('/category')
        .post(validate.category, Controller.createCategory);
    app.route('/category/:_id')
        .put(validate.category, Controller.editCategory)
        .delete(Controller.deleteCategory);
    app.route('/badge')
        .post(validate.badge, Controller.addBadge);
    app.route('/badge/:_id')
        .put(validate.badge, Controller.editBadge)
        .delete(Controller.deleteBadge);

    // TEACHER
    app.route('/teacher')
        .post(validate.teacherSignup, Controller.teacherSignup);
    app.route('/teacher/:_id')
        .get(Controller.validateTeacherCode)
        .put(validate.teacherAccount, Controller.editAccount);
    app.route('/teacher/:_id/password')
        .put(Controller.editPassword);
    app.route('/teacherCode/:teacherCode')
        .get(Controller.validateTeacherCode);
        
    // STUDENT
    app.route('/student')
        .post(validate.studentSignup, Controller.studentSignup);
    app.route('/student/:_id')
        .put(validate.studentAccount, Controller.editAccount);
    app.route('/student/:_id/password')
        .put(Controller.editPassword);
    app.route('/student/:_id/homework')
        .get(Controller.getHomework);
    app.route('/student/:_id/coins')
        .put(Controller.updateCoins);
    app.route('/student/:_id/badges')
        .put(Controller.updateBadges);
    app.route('/student/:_id/badge')
        .put(Controller.updateBadgeRedeemed);
    app.route('/student/:_id/closet')
        .put(Controller.updateCloset);
    app.route('/student/:_id/avatar')
        .put(Controller.updateAvatar);
}