const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../db/models/');
const bcrypt = require('bcryptjs');
const Mailer = require('../services/mailer');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user._id);
    })

    passport.deserializeUser(function (_id, done) {
        User.findOne({ _id }, (err, user) => {
            done(err, user);
        });
    })

    passport.use('signup', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, function (req, email, password, done) {
            User.findOne({ email }, (err, data) => {
                if (err)
                    return done(err);
                if (data) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
                } else {
                    const confirmHash = Mailer.generateHash();
                    let data = { passwordHash: bcrypt.hashSync(password, 10), emailConfirmationHash: confirmHash, email };

                    User.create(data, function(err, user) {
                        console.log('errrrrror', err);
                        Mailer.welcome(email, user._id, data.emailConfirmationHash);
                        return done(null, user);
                      })
                }
            })
        })
    )

    passport.use('login', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, function (req, email, password, done) {
            console.log('tartatat');
            User.findOne({ email }, (err, user) => {
                console.log('user', user);
                console.log('err', err);

                if (err)
                    return done(err);
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }
                if (!bcrypt.compareSync(password, user.passwordHash)) {
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                }
                return done(null, user);
            })
        })
    )
}
