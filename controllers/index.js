const express = require("express");
const app = express.Router();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// passport configuration
const passport = require('passport');
const User = require('../models/user');
const session = require('express-session');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'email'
},
    function (email, password, done) {
        User.findOne({ email }, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'Incorrect email.' });
            // authenticate password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err || !isMatch) return done(null, false);
                done(null, user);
            });
        });
    }
));

// implement JWT strategy
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;
opts.audience = 'weather.nafimrahman.com';
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({email: jwt_payload.sub}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));

const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

app.use(passport.initialize());

app.use("/api", require('./api'));
// app.use(require('./login'));
// app.use(require('./registration'));
// app.use(require('./reset'));

module.exports = app;