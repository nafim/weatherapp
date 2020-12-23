const express = require('express');
const app = express();
var axios = require("axios");
var cookieParser = require('cookie-parser');
app.use(cookieParser());

require('dotenv').config();
const port = 3000;

app.set('view engine', 'pug')
app.get('/', (req, res) => {  
  const zip = req.query.zipcode || req.cookies.zipcode || "02446" ;
  const queryParams = new URLSearchParams({
    zip,
    appid: process.env.OWM_API_KEY
});

  axios('http://api.openweathermap.org/data/2.5/weather?' + queryParams)
  .then(response => {
    const conditions = response.data.weather[0].main;
    const city = response.data.name;
    const temperature = (response.data.main.temp - 273.15) * 9/5 + 32;
    const humidity = response.data.main.humidity;
    const speed = response.data.wind.speed;
    const degree = response.data.wind.deg;
    const imgURL = `http://openweathermap.org/img/wn/${response.data.weather[0].icon}@4x.png`;
    res.cookie("zipcode", zip);
    res.render('weather', {conditions, city, temperature, humidity, speed, degree, imgURL});
  })
  .catch(error => {
      console.log(error);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
