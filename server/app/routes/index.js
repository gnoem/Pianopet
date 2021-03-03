import controller from '../controllers/index.js';
import { validate } from '../middleware/index.js';

export default function (app) {
    app.post('/custom', controller.custom);

    // COMMON
    app.get('/auth', controller.auth);
    app.post('/login', controller.login);
    app.get('/logout', controller.logout);

    // TEACHER
    app.route('/teacher')
        .post(validate.teacherSignup, controller.teacherSignup);
    app.route('/teacher/:id')
        .get(controller.getTeacher)
        .put(controller.editAccount);
    app.route('/teacher/:id/password')
        .put(controller.editPassword);
    app.route('/teacher/:id/wearable-category') // todo fix route name hierarchy
        .post(controller.addWearableCategory)
        .put(controller.editWearableCategory)
        .delete(controller.deleteWearableCategory);
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
    
    // STUDENT
    app.post('/student', validate.studentSignup, controller.studentSignup);
    app.route('/student/:id')
        .put(controller.editAccount);
    app.route('/student/:id/password')
        .put(controller.editPassword);
    app.route('/student/:id/homework')
        .get(controller.getHomework)
        .post(controller.addHomework);
    app.route('/student/homework/:id')
        .put(controller.editHomework)
        .delete(controller.deleteHomework);
    app.put('/assignment/:id/progress', controller.updateProgress);
    app.put('/assignment/:id/recorded', controller.updateRecorded);
    app.put('/student/:id/coins', controller.updateCoins);
    app.put('/student/:id/badges', controller.updateBadges);
    app.route('/student/:id/badge/redeemed')
        .put(controller.updateBadgeRedeemed);
    app.put('/student/:id/closet', controller.updateCloset);
    app.put('/student/:id/avatar', controller.updateAvatar);
}