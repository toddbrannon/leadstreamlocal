// routes/index.js
const express = require('express');
const router = express.Router();

// Render 'Get Started' page
router.get('/', (req, res) => {
    res.render('index');
});

// Render 'Features' page
router.get('/features', (req, res) => {
    res.render('features');
});

router.get('/getstartedform', (req, res) => {
    res.render('getstartedform');
});

// Handle form submission from 'Features' page for new user sign-up
router.post('/signup', (req, res) => {
    // TODO: Handle sign-up, send validation email
});

// Set up login page route
router.get('/login', (req, res, next) => {
    console.log("Accessing the login route");
    res.render('login', { 
      username: req.user ? req.user.username : null,
      isLoggedIn: req.isAuthenticated(),
      isAdmin: req.user ? req.user.permission === 'admin' : false
    });
});

// Handle email validation
router.get('/validate-email/:token', (req, res) => {
    // TODO: Validate email, render phone number validation page
});

// Handle phone number validation
router.post('/validate-phone', (req, res) => {
    // TODO: Validate phone number, redirect to 'Client Account' page
});

// Render 'Client Account' page with authentication check
router.get('/client-account', (req, res) => {
    // TODO: Check user authentication
    // if (/* user is authenticated */) {
        res.render('clientAccount');
    // } else {
    //     res.redirect('/features');  // Redirect to features page if not authenticated
    // }
});

module.exports = router;
