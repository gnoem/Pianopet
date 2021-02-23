const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('../client/build'));
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname + '../client/build/index.html'));
    });
}

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./app/config/db')();
require('./app/routes')(app);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});