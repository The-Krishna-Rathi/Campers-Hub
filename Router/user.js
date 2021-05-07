const express = require('express');
const router = express.Router({ mergeParams: true });
const AsyncWrap = require('../views/utilities/AsyncWrap');
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/user');

//getting registration form
router.get('/register', users.registerRender);

//posting the registration data to database
router.post('/register', AsyncWrap(users.register));

//getting the login form
router.get('/login', users.loginRender)

//Authenticating the user login credentials
router.post('/login', passport.authenticate('local', { failureRedirect: '/user/login', failureFlash: true }), users.login)

//logout the user
router.get('/logout', users.logout);

module.exports = router;