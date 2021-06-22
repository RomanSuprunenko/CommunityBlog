const passport = require('passport');
const { User } = require('../db/models/');
const Mailer = require('../services/mailer');

/**
 * Login user
 * @param req 
 * @param res 
 */
async function login(req, res, next) {
    passport.authenticate('login', function (err, user) {
        console.log('user', user);

        if (err) { return next(err); }
        if (!user) { return res.redirect('/auth/login'); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            req.session.save(() => {
                return res.redirect('/settings/profile/');
            })
        })
    })(req, res, next);
}

/**
 * Return login page
 * @param req 
 * @param res 
 */
function getLoginPage(req, res) {
    res.render('login.ejs', {
        title: 'Log in!',
        user: req.user,
        message: req.flash('loginMessage')
    });
}

/**
 * Return forgot password page
 * @param req 
 * @param res 
 */
function getForgotPage(req, res) {
    res.render('forgot.ejs', {
        title: 'Forgot Password?',
        user: req.user,
        message: ''
    });
}

/**
 * Return signup page
 * @param req 
 * @param res 
 */
function getSignupPage(req, res) {
    res.render('signup.ejs', {
        title: 'Sign up!',
        user: req.user,
        message: req.flash('signupMessage')
    });
}

/**
 * Set forgot password hash and send email to recover password
 * @param {*} req 
 * @param {*} res 
 */
async function forgotPassword(req, res) {
    const forgotPasswordHash = Mailer.generateHash();
    try{
        const user = await User.findOneAndUpdate({ email: req.body.email }, { forgotPasswordHash });
        console.log('2update hash', user);
        if (user) {
            Mailer.forgotPassword(req.body.email, user._id, forgotPasswordHash)
            res.render('forgot.ejs', {
                title: 'Forgot Password?',
                user: user,
                message: 'Check your email!'
            });
        }
    }
    catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Log out user
 * @param req 
 * @param res 
 */
function logout(req, res) {
    req.logout();
    req.session.destroy(() => {
      res.redirect('/auth/login');
    })
}

module.exports = {
    login,
    getLoginPage,
    getForgotPage,
    getSignupPage,
    forgotPassword,
    logout
};