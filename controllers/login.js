const express = require("express");
const app = express.Router();
const axios = require("axios");
const passport = require('passport');

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local'), (req, res) => {
    res.send(req.user.email);
});

app.get('/user', (req, res) => {
    if (req.user) return res.send(req.user.email);
    res.send('not logged in');
})

module.exports = app;