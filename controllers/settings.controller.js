const formidable = require('formidable');
const bcrypt = require('bcryptjs');
const { User } = require('../db/models/');
const mongoose = require('mongoose');

async function getProfilePage(req, res) {
    console.log('userrrrr', req.user);
    res.render('settings/profile.ejs', {
        title: 'Profile - Settings',
        user: req.user
    });
}

async function getEmailPage(req, res) {
    res.render('settings/email.ejs', {
        title: 'Email - Settings',
        user: req.user
    });
}

async function getImagesPage(req, res) {
    res.render('settings/images.ejs', {
        title: 'Images - Settings',
        user: req.user,
    });
}

async function getPasswordPage(req, res) {
    res.render('settings/password.ejs', {
        title: 'Images - Settings',
        user: req.user,
    });
}

/**
 * Edit user 
 * @param req
 * @param res
 */
async function editUser(req, res) {
    let _id = mongoose.Types.ObjectId(req.user._id);
    let data = {};
    if (req.body.password) {
            data.passwordHash = bcrypt.hashSync(req.body.password, 10);
            console.log('change password', data);
    }
    else {
        data = req.body;
    }
    await User.updateOne({ _id }, data);

    return res.redirect('/settings/profile');
}

module.exports = {
    getProfilePage,
    getEmailPage,
    getImagesPage,
    editUser,
    getPasswordPage
};

