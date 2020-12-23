const express = require("express");
const app = express.Router();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: false
}));

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

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (_id, done) {
    User.findById(_id, function (err, user) {
        done(err, user);
    });
});

app.use(session({ secret: process.env.SESSION_SECRET }));
app.use(passport.initialize());
app.use(passport.session());

app.use(require('./home'));
app.use(require('./login'));
app.use(require('./registration'));

module.exports = app;