const express = require("express");
const app = express.Router();
const axios = require("axios");
const User = require('../models/user');

app.get('/', (req, res) => {
    const zip = req.query.zipcode || req.cookies.zipcode || "02446";
    const queryParams = new URLSearchParams({
        zip,
        appid: process.env.OWM_API_KEY
    });

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
            locals.imgURL = `http://openweathermap.org/img/wn/${response.data.weather[0].icon}@4x.png`;

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
            console.log(error);
        });
});

app.post('/save', (req, res) => {
    User.findOne({ email: req.user.email }, (err, obj) => {
        const userLocs = obj.locations ? obj.locations : [];
        const addZip = req.body.addZip;
        const zipIndex = userLocs.indexOf(addZip);
        if (zipIndex === -1) {
            userLocs.push(addZip);
        } else {
            userLocs.splice(zipIndex, 1);
        }

        obj.locations = userLocs;
        obj.save();
        res.redirect('/');
    });
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

module.exports = app;