const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const User = require('../models/user.js');
const app = express();
const nodemailer = require('nodemailer');
const { checkSchema, validationResult } = require('express-validator');
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
        console.log("Saving new user");
        await user.save();
        res.redirect('/auth/complete-registration?email=' + email);
    } 
    catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/complete-registration', function(req, res, next) {
    console.log("Calling the /complete-registration route");
    const email = req.query.email;

    if (!email) {
        return res.status(400).send('Email parameter is missing');
    }

    res.render('complete-registration', { email: email });
});

router.post('/complete-registration', checkSchema({
    username: {
      in: ['body'],
      isAlphanumeric: true,
      isLength: {
        options: { min: 6, max: 12 },
      },
      errorMessage: 'Username must be 6-12 characters long and may contain letters and numbers only.',
    },
    password: {
      in: ['body'],
      isLength: {
        options: { min: 8 },
      },
      custom: {
        options: (value) => {
          // At least one uppercase letter, one lowercase letter and one number
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
          return regex.test(value);
        },
        errorMessage: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.',
      },
    },
    confirmPassword: {
      in: ['body'],
      custom: {
        options: (value, { req }) => value === req.body.password,
        errorMessage: 'Password confirmation does not match password',
      },
    },
  }), async (req, res, next) => {
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);  // Log validation errors
        return res.render('complete-registration', { errors: errors.array() });
    }

    const { username, password, confirmPassword, email } = req.body;
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        console.error('User not found');  // Log an error message
        return res.render('complete-registration', { error: 'User not found.' });
    }

    user.username = username;
    user.password = password;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.APP_SPEC_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: req.body.email,
        subject: 'Please Confirm Your Email Address',
        html: `
            <p>Hi ${user.firstName} ${user.lastName}!</p>
            <p>Thank you for signing up at Lead Stream Local. To complete your registration and enjoy all the features, please confirm your email address by clicking the button below:</p>
            <a href="${process.env.BASE_URL}/auth/confirm-email?email=${req.body.email}" target="_blank" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Confirm Email</a>
            <br><br>
            <p>Alternatively, you can confirm your email address by copying and pasting the following link into your web browser:</p>
            <p><a href="${process.env.BASE_URL}/auth/confirm-email?email=${req.body.email}">http://yourwebsite.com/auth/confirm-email?email=${req.body.email}</a></p>
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

    res.render('email_sent', { isLoggedIn: res.locals.isLoggedIn, email: email });
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

router.get('/register', function(req, res, next) {
    res.send("Register page");
});


// Set up login page route
router.get('/login', function(req, res, next) {
    console.log('Calling the /login route');
    res.render('login', { 
      username: req.user ? req.user.username : null,
      isLoggedIn: req.isAuthenticated(),
      isAdmin: req.user ? req.user.permission === 'admin' : false
    });
  });

router.post('/login/password', passport.authenticate('local-login', {
    successReturnToOrRedirect: '/dashboard',
    failureRedirect: '/login',
    failureMessage: true
  }), (req, res) => {
     console.log('If you see this, authentication was successful');
     res.redirect('/dashboard');
  });

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
