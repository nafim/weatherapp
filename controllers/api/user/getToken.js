const express = require("express");
const app = express.Router();
const axios = require("axios");
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { authenticateLocal } = require("../../../middlewares/passportErrorJson");



app.post('/getToken',
    authenticateLocal,
    (req, res, next) => {
        const token = jwt.sign({
            sub: req.user.email,
            aud: process.env.JWT_TOKEN_AUDIENCE}, 
            process.env.JWT_SECRET)
        
        return res.status(200).json({ token })
    }
)

module.exports = app;