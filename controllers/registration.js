const express = require("express");
const app = express.Router();
const axios = require("axios");
const User = require('../models/user');
const FormData = require('form-data');
const { body, validationResult } = require('express-validator');

// Recaptchas

app.get('/registration', (req, res) => {
    res.render('registration', { sitekey: process.env.RECAPTCHA_SITE });
});

const validateRecaptcha = (req, res, next) => {
        // recaptcha check
        const bodyFormData = new FormData();
        bodyFormData.append('secret', process.env.RECAPTCHA_SECRET);
        bodyFormData.append('response', req.body['g-recaptcha-response']);
        axios.post("https://www.google.com/recaptcha/api/siteverify", bodyFormData, {
            headers: bodyFormData.getHeaders()
        })
        .then(res => {
            req.recaptchaVerified = res.data.success;
            next();
        })
        .catch(err => next(err));
};

app.post(
    '/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    validateRecaptcha,
    (req, res) => {
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
            });
        } else {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/registration');
        }
        res.redirect('/');
});

module.exports = app;