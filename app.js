// app.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const index_routes = require('./routes/index_router');  // Import the routes
const auth_routes = require('./routes/auth_router');  // Import the auth routes
const notificationRoutes = require('./routes/notification_router');
const passport = require('passport');
require('dotenv').config();

const mongoose = require('mongoose');

const app = express();

require('dotenv').config(); // Load environment variables from .env file

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', './views');

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('Error connecting to MongoDB', err);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'shh, it\'s a secret',
    resave: false,
    saveUninitialized: true,
}));

// Set up session middleware
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false
  }));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

app.use(passport.authenticate('session'));
app.use(function(req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});

app.use((req, res, next) => {
    res.locals.currentRoute = req.originalUrl;
    next();
  });

app.use('/', index_routes);  // Integrate the routes
app.use('/auth', auth_routes);  // Integrate the auth routes
// app.use('/notifications', notificationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
