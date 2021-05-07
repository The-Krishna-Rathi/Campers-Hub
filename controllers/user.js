const User = require('../models/user');
const passport = require('passport');

module.exports.registerRender = (req, res) => {
    res.render('./user/Register');
};

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, function (err) {
            if (err) { return next(err); }
            req.flash('success', 'Welcome to campground');
            res.redirect('/campground');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/user/register');
    }
}

module.exports.loginRender = (req, res) => {
    res.render('./user/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome to the Yelp-camp');
    const redirecturl = req.session.returnto;
    if (redirecturl) {
        delete (req.session.returnto);
        return res.redirect(redirecturl);
    } else {
        res.redirect('/campground');
    }
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Successfully Logged-Out');
    res.redirect('/user/login');
}