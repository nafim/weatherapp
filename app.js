const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
require('dotenv').config();
app.use(cookieParser());
app.use(require('./controllers'));

const port = 3000;

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

// set rendering engine
app.set('view engine', 'pug');

app.use(require('./controllers'));

app.listen(port, () => {
  console.log(`Weather app listening at http://localhost:${port}`);
});
