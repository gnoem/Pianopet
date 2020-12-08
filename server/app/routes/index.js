//const mongoose = require('mongoose');

module.exports = (app) => {
    app.post('/user/login', (req, res) => {
        console.log('Logged in');
    });
}