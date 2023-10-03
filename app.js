// app.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const index_routes = require('./routes/index_router');  // Import the routes

const app = express();

require('dotenv').config(); // Load environment variables from .env file

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', './views');



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'shh, it\'s a secret',
    resave: false,
    saveUninitialized: true,
}));

app.use('/', index_routes);  // Integrate the routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
