const express = require("express");
const app = express.Router();
const axios = require("axios");
const User = require('../models/user');

app.get('/', (req, res, next) => {
    const zip = req.query.zipcode || req.cookies.zipcode || "02446";
    const queryParams = new URLSearchParams({
        zip,
        appid: process.env.OWM_API_KEY
    });

    if (zip.length !== 5) {
        req.flash('alert', 'Invalid zipcode');
        return res.redirect('/');
    }

    axios('http://api.openweathermap.org/data/2.5/weather?' + queryParams)
        .then(response => {
            const locals = {};

            // weather info
            locals.conditions = response.data.weather[0].main;
            locals.city = response.data.name;
            locals.temperature = Math.round((response.data.main.temp - 273.15) * 9 / 5 + 32);
            locals.humidity = response.data.main.humidity;
            locals.speed = response.data.wind.speed;
            locals.degree = response.data.wind.deg;
            locals.imgURL = `//openweathermap.org/img/wn/${response.data.weather[0].icon}@4x.png`;

            // login info
            locals.logged = req.user ? true : false;
            if (locals.logged){
                locals.locations = req.user.locations ? req.user.locations : [];
            }
            locals.user = req.user ? req.user.email : '';
            res.cookie("zipcode", zip);
            res.render('weather', locals);
        })
        .catch(error => {
            // if invalid zipcode
            if (error.response.data.cod === '404') {
                req.flash('alert', 'Invalid zipcode');
                return res.redirect('/');
            }
            next(error);
        });
});

const checkValidZip = (req, res, next) => {
    const zip = req.body.addZip;
    if (zip.length !== 5) {
        req.flash('zipAlert', 'Invalid zipcode');
        return res.redirect('/');
    }
    const queryParams = new URLSearchParams({
        zip,
        appid: process.env.OWM_API_KEY
    });
    axios('http://api.openweathermap.org/data/2.5/weather?' + queryParams)
    .then(response => {
        next();
    })
    .catch(error => {
        // if invalid zipcode
        if (error.response.data.cod === '404') {
            req.flash('zipAlert', 'Invalid zipcode');
            return res.redirect('/');
        }
        next(error);
    });
};

app.post('/save',
    checkValidZip,
    (req, res) => {
    // find the user to add zipcodes to
    User.findOne({ email: req.user.email }, (err, user) => {
        const userLocs = user.locations ? user.locations : [];
        const addZip = req.body.addZip;

        // if zipcode exists, delete it, else add it to list of zipcodes
        const zipIndex = userLocs.indexOf(addZip);
        if (zipIndex === -1) {
            userLocs.push(addZip);
        } else {
            userLocs.splice(zipIndex, 1);
        }

        user.locations = userLocs;
        user.save();
        res.redirect('/');
    });
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

module.exports = app;