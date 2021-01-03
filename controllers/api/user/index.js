const express = require('express');
const app = express.Router();

app.use(require('./getToken'));
app.use(require('./getLocations'));
app.use(require('./setLocations'));
app.use(require('./signup'));
app.use(require('./sendResetEmail'));
app.use(require('./changePassword'));


module.exports = app;