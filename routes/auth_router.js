const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const User = require('../models/user.js');
const app = express();
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');
const router = express.Router();


// Parse URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));

router.post('/register', async (req, res) => {
    console.log('Received request to /register');
    const {
        firstName, lastName, companyName, title, email, phone
    } = req.body;
  
    try {
        // Validate required fields
        if (!firstName || !lastName || !companyName || !title || !email || !phone) {
            return res.status(400).send('Missing required fields');
        }

        // Create a new user
        const user = new User({
            firstName, lastName, companyName, title, email, phone
        });
        console.log("Saving new user")
        await user.save();

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME, // Your Gmail username
                pass: process.env.APP_SPEC_PASSWORD // Your Gmail password
            }
        });

        // Send validation email
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Please Confirm Your Email Address',
            html: `
                <p>Hi ${firstName} ${lastName}!</p>
                <p>Thank you for signing up at Lead Stream Local. To complete your registration and enjoy all the features, please confirm your email address by clicking the button below:</p>
        
                <a href="${process.env.BASE_URL}/auth/complete-registration?email=${email}" target="_blank" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Confirm Email</a>
                <br><br>
                <p>Alternatively, you can confirm your email address by copying and pasting the following link into your web browser:</p>

                <p><a href="${process.env.BASE_URL}/auth/complete-registration?email=${email}">http://yourwebsite.com/auth/complete-registration?email=${email}</a></p>
                        
                <p>Please note: This confirmation link will expire in 48 hours.</p>
                        
                <p>If you have any questions or run into any issues, feel free to reach out to our support team at support@leadstreamlocal.com.</p>
            `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        // Render the email_sent view
        res.render('email_sent', { isLoggedIn: res.locals.isLoggedIn, email: email });
    } 
    catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Render the view for user to select username and password as a part of the email confirmation step
router.get('/complete-registration', function(req, res, next) {
    console.log("Calling the /complete-registration route")
    // extract the email parameter from the query string
    const email = req.query.email;
  
    if (!email) {
      // handle the case where email parameter is missing
      return res.status(400).send('Email parameter is missing');
    }
  
    // render a view or do something else with the email parameter
    res.render('complete-registration', { email: email });
  });

// Handle username and password creation part of new user registration (separate step as a part of email confirmation step)
router.post('/complete-registration', [
    check('username').isAlphanumeric().isLength({ min: 6, max: 12 }),
    check('password').isStrongPassword(),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
], async (req, res, next) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('complete_registration', { errors: errors.array() });
    }
    
    const { username, password, confirmPassword } = req.body;
    
    // Query the database to find the user (assuming email is passed as a hidden field in the form)
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        // handle user not found
        return res.render('complete_registration', { error: 'User not found.' });
    }
    
    // Update the user document
    user.username = username;
    user.password = password;  // Your User model should hash the password before saving
    await user.save();
    
    // Redirect to dashboard
    res.redirect('/dashboard');
});

  

passport.use(
  "local-login",
  new LocalStrategy(
    {
      username: "username",
      password: "password",
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username: username });
        if (!user) return done(null, false, { message: 'Incorrect username or password.' });
        const isMatch = await user.matchPassword(password);
        if (!isMatch)
          return done(null, false, { message: 'Incorrect username or password.' });
        // if passwords match return user
        return done(null, user);
      } catch (error) {
        console.log(error)
        return done(error, false);
      }
    }
  )
);

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// Set up register page route
router.get('/register', function(req, res, next) {
  res.send("Register page");
});


// Set up login page route
router.get('/login', function(req, res, next) {
  console.log("Accessing the login route");
  res.render('login', { isLoggedIn: req.isAuthenticated() });
});

router.post('/login/password', passport.authenticate('local-login', {
  successReturnToOrRedirect: '/admin/users',
  failureRedirect: '/login',
  failureMessage: true
}));

/* POST /logout
 *
 * This route logs the user out.
 */
router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

router.get('/logout', function(req, res, next) {
  res.render('login', { isLoggedIn: req.isAuthenticated() });
});

module.exports = router;
