const express = require('express');
const app = express();
require('dotenv').config();
app.use(require('./controllers'));

const port = 4000;

// Connect to database
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true 
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});


// static file serve
app.use(express.static('public'));

app.use(require('./controllers'));

// Error handler
const notFoundHandler = (req, res, next) => {
  return res.status(404).json({error: "Endpoint not found"});
};

// Error handler
const errorHandler = (err, req, res, next) => {
  return res.status(500).json({error: "Internal Server error."});
};

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Weather app listening at http://localhost:${port}`);
});
