var http = require("http");

const PORT = 3000;

http.createServer((request, response) => {
    response.write("hello there, nafim")
    response.end()
}).listen(PORT);