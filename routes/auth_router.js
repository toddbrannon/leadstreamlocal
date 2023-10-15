const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const User = require('../models/user.js');
const app = express();
const router = express.Router();

// Parse JSON request bodies
app.use(bodyParser.json());

// Parse URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));

router.post('/register', async (req, res) => {
  const { email_address, username, password } = req.body;
  
  try {

    // if (!email_address || !username || !password) {
    //   return res.status(400).send('Missing required fields');
    // }

    console.log("Email: " + email_address);
    console.log("Username: " + username);
    console.log("Password: " + password);

    if (!email_address) {
      console.log('Missing email_address field');
      return res.status(400).send('Missing email_address field');
    }
    if (!username) {
      console.log('Missing username field');
      return res.status(400).send('Missing username field');
    }
    if (!password) {
      console.log('Missing password field');
      return res.status(400).send('Missing password field');
    }

    // Create a new user with a hardcoded ID for testing
    const user = new User({ email_address, username });
    await user.setPassword(password);
    await user.save();
    res.send('User registered successfully');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error registering user');
  }
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
