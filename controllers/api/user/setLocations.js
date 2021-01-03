const express = require("express");
const app = express.Router();
const axios = require("axios");
const passport = require('passport');

const jwt = require('jsonwebtoken');
const { authenticateJWT } = require("../../../middlewares/passportErrorJson");
const User = require("../../../models/user");



app.post('/setLocations',
    authenticateJWT,
    (req, res) => {
        req.user.locations = req.body.locations;
        req.user.save();
        res.status(201).json({success: true});
    }
)

module.exports = app;