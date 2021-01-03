const express = require("express");
const app = express.Router();
const { body, validationResult } = require('express-validator');
const User = require("../../../models/user");
const { authenticateJWT } = require("../../../middlewares/passportErrorJson");


app.post('/changePassword',
    body('password').isLength({ min: 5 }),
    authenticateJWT,
    (req, res) => {
        const errors = validationResult(req);
        if (errors.mapped().password) {
            return res.status(400).json({error: "Password is too short", errorItem: "password"})
        }

        if (req.body.password === req.body.confirmPassword) {
            User.findOne({ email: req.user.email }, (err, user) => {
                if (err) {
                    console.error(err);
                } else if (!user) {
                    res.status(500).json({error: "Something went wrong"})
                }
                user.password = req.body.password;
                user.save();
                res.status(200).json({success: "Password has been reset successfully!"})
            });
        } else {
            return res.status(400).json({error: "Password does not match", errorItem: "confirmPassword"})
        }

    });

module.exports = app;