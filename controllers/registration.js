const express = require("express");
const app = express.Router();
const axios = require("axios");
const User = require('../models/user');
const FormData = require('form-data');
const { body, validationResult } = require('express-validator');
const validateRecaptcha = require('../middlewares/recaptcha').validateRecaptcha;
const passport = require('passport');

// Validate email is unique
const validateUniqueEmail = (req, res, next) => {
    User.exists({ email: req.body.email })
    .then(notUnique => {
        if (notUnique) {
            req.flash('error', 'User with this email already exists');
            return res.redirect('/registration');
        } else {
            next();
        }
    })
    .catch(err => {
        next(err);
    });
};

app.get('/registration', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('registration', { sitekey: process.env.RECAPTCHA_SITE });
});


app.post(
    '/registration',
    body('email').isEmail(),
    validateUniqueEmail,
    body('password').isLength({ min: 5 }),
    validateRecaptcha,
    (req, res, next) => {
        // recaptcha check
        if (!req.recaptchaVerified) {
            req.flash('error', 'Failed recaptcha check');
            return res.redirect('/registration');
        }

        const errors = validationResult(req);
        if (errors.mapped().email) {
            req.flash('error', 'Invalid Email');
            return res.redirect('/registration');
        } else if(errors.mapped().password) {
            req.flash('error', 'Invalid Password');
            return res.redirect('/registration');
        }
        if (req.body.password === req.body.confirmPassword){
            const user = new User({
                email: req.body.email,
                password: req.body.password
            });
            user.save(function (err, user) {
                if (err) return console.error(err);
                next();
            });
        } else {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/registration');
        }
    },
    passport.authenticate('local'),
    (req, res) => {
        res.redirect('/');
    });

module.exports = app;