module.exports = {
    secret: process.env.SECRET_KEY || require('./vars').SECRET_KEY
}