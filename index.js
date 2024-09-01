const express = require('express');
const app = express();
const authRoute = require('./routes/auth');
const quizRoute = require('./routes/quiz');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const authMiddleware = require('./middleware/auth');
dotenv.config();
const port = process.env.port || 3000;
const cors = require('cors');
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
    res.send('Welcome to Quiz Builder App!');
});

app.use((req, res, next) => {
    const reqString = `${req.method} ${req.url} ${Date.now()}\n`;
    fs.writeFile('log.txt', reqString, { flag: "a" }, (err) => {
        if (err) {
            console.log(err);
        }
    });
    next();
});

app.use('/v1/auth', authRoute);
app.use('/v1/quiz', quizRoute);

app.use((err, req, res, next) => {
    const reqString = `${req.method} ${req.url} ${Date.now()} ${err.message}\n`;
    fs.writeFile('error.txt', reqString, { flag: "a" }, (err) => {
        if (err) {
            console.log(err);
        }
    });
    res.status(500).send('Internal Server Error');
    next();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}!`);
    mongoose.connect(process.env.DB_CONNECT);
});
