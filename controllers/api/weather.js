const express = require('express');
const axios = require('axios');
const app = express.Router();

app.get('/weather', (req, res) => {
    const zip = req.query.zipcode;
    const queryParams = new URLSearchParams({
        zip,
        appid: process.env.OWM_API_KEY
    });

    if (zip.length !== 5) {
        return res.status(400).json({"error": 'Invalid Zipcode'});
    }

    axios('http://api.openweathermap.org/data/2.5/weather?' + queryParams)
        .then(response => {
            const weather_result = {};

            // weather info
            weather_result.condition = response.data.weather[0].main;
            weather_result.city = response.data.name;
            weather_result.temperature = Math.round((response.data.main.temp - 273.15) * 9 / 5 + 32);
            weather_result.humidity = response.data.main.humidity;
            weather_result.windSpeed = response.data.wind.speed;
            weather_result.windDegree = response.data.wind.deg;
            weather_result.imgURL = `//openweathermap.org/img/wn/${response.data.weather[0].icon}@4x.png`;

            res.json(weather_result);
        })
        .catch(error => {
            // if invalid zipcode
            if (error.response){
                if (error.response.status === 404) {
                    return res.status(400).json({"error": 'Invalid Zipcode'});
                }
            }
            return res.status(500).json({"error": 'Internal Server Error'});
        });
})

module.exports = app;