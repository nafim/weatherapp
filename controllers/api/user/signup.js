const express = require("express");
const app = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require("../../../models/user");

// Validate email is unique
const validateUniqueEmail = (req, res, next) => {
    User.exists({ email: req.body.email })
    .then(notUnique => {
        if (notUnique) {
            return res.status(400).json({error: "This email is already signed up", errorItem: "email"});
        } else {
            next();
        }
    })
    .catch(err => {
        next(err);
    });
};

app.post('/signup',
    body('email').isEmail(),
    validateUniqueEmail,
    body('password').isLength({ min: 5 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (errors.mapped().email) {
            return res.status(400).json({error: "Invalid email", errorItem: "email"});
        } else if(errors.mapped().password) {
            return res.status(400).json({error: "Password is too short", errorItem: "password"});
        }
        if (req.body.password === req.body.confirmPassword){
            const user = new User({
                email: req.body.email,
                password: req.body.password
            });
            user.save(function (err, user) {
                if (err) next(err);
                const token = jwt.sign({
                    sub: user.email,
                    aud: process.env.JWT_TOKEN_AUDIENCE}, 
                    process.env.JWT_SECRET)
                
                return res.json({ token })
            });
        } else {
            return res.status(400).json({error: "Password does not match", errorItem: "confirmPassword"});
        }
    },
);

module.exports = app;