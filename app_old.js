var http = require("http");
var url = require("url");
var axios = require("axios");

require('dotenv').config();


const PORT = 3000;

function oldHandle(request, response) {
    response.write("hello there, nafim\n")
    const parsedUrl = url.parse(request.url, true)
    console.log(parsedUrl)
    response.write(request.url)
    response.end()
}

function handle(request, response) {
    const parsedUrl = url.parse(request.url, true)
    const zip = parsedUrl.query.zipcode;
    const queryParams = new URLSearchParams({
        zip,
        appid: process.env.OWM_API_KEY
    })
    axios('http://api.openweathermap.org/data/2.5/weather?' + queryParams)
        .then(res => {
            const conditions = res.data.weather[0].main
            response.write(`The weather in ${res.data.name} is ${conditions}`)
        })
        .catch(error => {
            response.write("error")
            console.log(error)
        })
        .then(_ =>
            response.end()
        )

}

http.createServer(handle).listen(PORT);