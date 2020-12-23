const express = require("express");
const app = express.Router();
const axios = require("axios");
const User = require('../models/user');

app.get('/registration', (req, res) => {
    res.render('registration');
});

app.post('/registration', (req, res) => {
    if (req.body.password === req.body.confirmPassword){
        const user = new User({
            email: req.body.email,
            password: req.body.password
        });
        user.save(function (err, user) {
            if (err) return console.error(err);
        });
    } else {
        return res.send('Passwords did not match');
    }
    res.redirect('/');
});

module.exports = app;