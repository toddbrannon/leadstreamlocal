// routes/index.js
const express = require('express');
const router = express.Router();

// Render 'Get Started' page
router.get('/', (req, res) => {
    res.render('index');
});

// Handle form submission from 'Get Started' page
router.post('/submit-form', (req, res) => {
    // TODO: Handle form submission, send validation email
});

// Handle email validation
router.get('/validate-email/:token', (req, res) => {
    // TODO: Validate email, render phone number validation page
});

// Handle phone number validation
router.post('/validate-phone', (req, res) => {
    // TODO: Validate phone number, redirect to 'Client Account' page
});

// Render 'Client Account' page
router.get('/client-account', (req, res) => {
    res.render('clientAccount');
});

module.exports = router;
