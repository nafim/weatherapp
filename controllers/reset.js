const express = require("express");
const app = express.Router();
const axios = require("axios");
const passport = require('passport');
const validateRecaptcha = require('../middlewares/recaptcha').validateRecaptcha;
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const pug = require("pug");

function sendEmail(email, resetKey, cb) {
    const mailgunAuth = {
        auth: {
            api_key: process.env.MAILGUN_KEY,
            domain: process.env.EMAIL_DOMAIN
        }
    };
    const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));
    const resetLink = `http://localhost:3000/passwordchange/${resetKey}`;
    const html = pug.renderFile("views/resetEmail.pug", {resetLink});
    const mailOptions = {
        from: `admin@${process.env.EMAIL_DOMAIN}`,
        to: email,
        subject: "Weather App Password Reset",
        html: html
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
        return cb(error);
    });
}

// Password reset function
// cb(error) will be called with true if error occurs
function attemptPasswordReset(email, cb) {
    User.findOne({ email }, (err, user) => {
        if (err) return;
        if (!user) return;
        const buf = crypto.randomBytes(32);
        const resetKey = buf.toString('hex');
        user.resetKey = resetKey;
        user.save();
        sendEmail(email, resetKey, cb);
    });
}

app.get('/reset', (req, res) => {
    res.render('reset', { sitekey: process.env.RECAPTCHA_SITE });
});

app.get('/passwordchange/:key', (req, res) => {
    const resetKey = req.params.key;
    if (!resetKey) {
        req.flash('alert', 'Something went wrong... Pease try again');
        return res.redirect('/');
    }
    User.findOne({ resetKey }, (err, user) => {
        if (err) {
            console.error(err);
            req.flash('alert', 'Something went wrong... Pease try again');
            return res.redirect('/');
        } else if (!user) {
            req.flash('alert', 'Invalid link');
            return res.redirect('/');
        }
        res.render('passwordChange', { resetKey });
    });
});

app.post('/reset',
    validateRecaptcha,
    body('email').isEmail(),
    (req, res, next) => {
        const errors = validationResult(req);
        // recaptcha check
        if (!req.recaptchaVerified) {
            req.flash('error', 'Failed recaptcha check');
            return res.redirect('/reset');
        } else if (errors.mapped().password) {
            req.flash('error', 'Invalid Password');
            return res.redirect('/reset');
        } else {
            attemptPasswordReset(req.body.email, (err) => {
                if (err) {
                    return next(err);
                } else {
                    req.flash('alert', "If the email is good, a password reset will be sent.");
                    res.redirect('/');
                }
            });
        }
    });

app.post('/passwordchange',
    body('password').isLength({ min: 5 }),
    (req, res) => {
        const resetKey = req.body.resetKey;
        const errors = validationResult(req);
        if (errors.mapped().password) {
            req.flash('error', 'Invalid Password');
            return res.redirect(`/passwordchange/${resetKey}`);
        }

        if (req.body.password === req.body.confirmPassword) {
            User.findOne({ resetKey }, (err, user) => {
                if (err) {
                    console.error(err);
                    req.flash('alert', 'Something went wrong... Pease try again');
                    return res.redirect('/');
                } else if (!user) {
                    req.flash('alert', 'Invalid user');
                    return res.redirect('/');
                }
                user.password = req.body.password;
                user.resetKet = undefined;
                user.save();
                req.flash('alert', 'Password reset successfully');
                res.redirect('/');
            });
        } else {
            req.flash('error', 'Passwords do not match');
            res.redirect(`/passwordchange/${resetKey}`);
        }

    });

module.exports = app;