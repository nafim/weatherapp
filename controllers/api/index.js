const express = require('express');
const app = express.Router();
const cors = require('cors');

// enable cors
app.use(cors());

app.use(require('./weather'));
app.use('/user', require('./user'))

module.exports = app;