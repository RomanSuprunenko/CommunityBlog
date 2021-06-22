const { User, Storyboard } = require('../db/models/');
const formidable = require('formidable');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');

/**
 * Get user 
 * @param req
 * @param res
 */
async function getUser(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);

    if (!_id) {
        return res.send({ message: 'Id is missing in params' });
    }
    try {
        const user = await User.findOne({ _id });
        if (user) {
            return res.send(user);
        } else {
            return res.send('User with id ' + _id + ' was not found');
        }
    } catch ({ message }) {
        return res.send({ message });
    }
}

/**
 * Get all users
 * @param req
 * @param res
 */
async function getUsers(req, res) {
    try {
        console.log('here');
        const users = await User.getAll();
        res.send(users);
    } catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Create user 
 * @param req
 * @param res
 * @param next
 */
function createUser(req, res, next) {
    passport.authenticate('signup', function (err, user) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/auth/signup') }
        // req.logIn(user, function (err) {
        //     if (err) { return next(err); }
        return res.redirect('/auth/login');
        // })
    })(req, res, next);
}

/**
 * Delete user 
 * @param req
 * @param res
 */
async function deleteUser(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);
    try {
        let res = await User.remove({ _id });
        console.log('res', res);

        res.send({
            data: { _id },
            message: 'User was successfully deleted',
        })
    } catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Reset user password function
 * @param req
 * @param res
 */

async function resetPassword(req, res) {
    const { password, confirmPassword, userId } = req.body;
    let _id = mongoose.Types.ObjectId(userId);

    if (password !== confirmPassword) return res.send({ message: 'validation error. password and confirm password should match' });
    try {
        const passwordHash = bcrypt.hashSync(password, 10);
        await User.updateOne({ _id }, { passwordHash });
        return res.redirect('/auth/login');
    }
    catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Returns Reset user password page
 * @param req
 * @param res
 */
async function getResetPasswordPage(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);
    try {
        let user = await User.find({ _id });

        res.render('reset_password.ejs', {
            title: `Let's reset that password now!`,
            userId: _id,
            forgotPasswordHash: req.params.forgotPasswordHash,
            user: user,
            message: ''
        })
    }
    catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Upload files archive
 * @param req
 * @param res
 */
function upload(req, res) {
    let form = new formidable.IncomingForm();
    form.uploadDir = "/tmp/";
    try {
        form.parse(req, async function (err, fields, files) {
            if (err) {
                console.log('setting flash!', err);
                req.session.sessionFlash = err;

                req.session.save(() => {
                    res.redirect('/upload');
                })
            }
            const storyboard = await Storyboard.upload(fields, files.zip.path, req.user);
            res.redirect('/storyboards/' + storyboard._id);
        })
    } catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Update user profile image
 * @param req 
 * @param res 
 */
async function updateProfileImage(req, res) {
    let form = new formidable.IncomingForm();
    form.uploadDir = "/tmp/";
    form.parse(req, async function (err, fields, files) {
        if (!files.profile_image) {
            res.redirect('/settings/images');
        } else {
            await User.updateProfileImage(files.profile_image.path, req.user._id);
            res.redirect('/settings/images');
        }
    })
}

/**
 * Returns user profile data
 * @param {*} req 
 * @param {*} res 
 */
function getProfile(req, res) {
    if (req.user._id) {
        if (req.user.hasAvatar) {
            res.redirect('/storyboarders/' + req.user._id);
        } else {
            res.redirect('/settings/images');
        }
    } else {
        res.redirect('/');
    }
}

/**
 * Returns get all user's storyboards
 * @param {*} req 
 * @param {*} res 
 */
async function getUserStoryboards(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);

    try {
        const profileUser = await User.findOne({ _id });
        if (!profileUser) res.send('User with id ' + _id + ' was not found');

        const storyboards = await Storyboard.find({ createdBy: _id });

        res.render('profile_user.ejs', {
            title: profileUser.displayName + ' on Storyboarders',
            profileUser: profileUser,
            storyboards: storyboards,
            user: req.user
        });
    } catch ({ message }) {
        console.log('message', message);
        res.send({ message });
    }
}

/**
 * Return uplaod page
 * @param req 
 * @param res 
 */
function getUploadPage(req, res) {
    console.log('upload screen');
    res.render('upload.ejs', {
        title: 'Upload a storyboard',
        user: req.user,
        message: ''
    });
}

/**
 * Confirm user email
 * @param req 
 * @param res 
 */
async function confirmEmail(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);
    let { emailConfirmationHash } = req.params;
    try {
        await User.updateOne({ _id, emailConfirmationHash }, { emailConfirmationHash: '', emailConfirmed: true });

        res.redirect('/auth/login');
    } catch ({ message }) {
        res.send({ message });
    }
}

module.exports = {
    getUser,
    getUsers,
    createUser,
    // editUser,
    deleteUser,
    resetPassword,
    getResetPasswordPage,
    upload,
    updateProfileImage,
    getProfile,
    getUserStoryboards,
    getUploadPage,
    confirmEmail
};
