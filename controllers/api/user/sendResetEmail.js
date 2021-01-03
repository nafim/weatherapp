const express = require("express");
const app = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const pug = require("pug");
const User = require("../../../models/user");
const jwt = require('jsonwebtoken');

function sendEmail(email, resetKey, cb) {
    const mailgunAuth = {
        auth: {
            api_key: process.env.MAILGUN_KEY,
            domain: process.env.EMAIL_DOMAIN
        }
    };
    const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));
    const resetLink = `http://localhost:3000/changePassword/${resetKey}`;
    const html = pug.renderFile("views/resetEmail.pug", {resetLink});
    const mailOptions = {
        from: `admin@${process.env.EMAIL_DOMAIN}`,
        to: email,
        subject: "Weather App Password Reset",
        html: html
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
        console.error(error);
        console.log(response);
        return cb(error);
    });
}

function attemptPasswordReset(email, cb) {
    User.findOne({ email }, (err, user) => {
        if (err) return;
        if (!user) return;
        const resetKey = jwt.sign({
            sub: user.email,
            aud: process.env.JWT_TOKEN_AUDIENCE},
            process.env.JWT_SECRET,
            {
                expiresIn: '30m'
            }
            )
        sendEmail(email, resetKey, cb);
    });
}

app.post('/sendResetEmail',
    body('email').isEmail(),
    (req, res, next) => {
        const errors = validationResult(req);
        // valid email check
        if (errors.mapped().email) {
            res.status(400).json({"error": 'Invalid email'})
        } else {
            attemptPasswordReset(req.body.email, (err) => {
                if (err) {
                    return next(err);
                } else {
                    res.status(400).json({"success": 'If the email address exists, a password reset email will be sent.'});
                }
            });
        }
    });


module.exports = app;