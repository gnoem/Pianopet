const { SECRET_KEY } = require('./');

module.exports = {
    secret: process.env.SECRET_KEY || SECRET_KEY
}