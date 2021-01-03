const express = require("express");
const app = express.Router();
const axios = require("axios");
const passport = require('passport');

const jwt = require('jsonwebtoken');
const { authenticateJWT } = require("../../../middlewares/passportErrorJson");



app.get('/getLocations',
    authenticateJWT,
    (req, res) => {
        res.status(200).json({ locations: req.user.locations, user: req.user.email});
    }
)

module.exports = app;