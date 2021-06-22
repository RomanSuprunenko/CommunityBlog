const { User, Storyboard } = require('../db/models/');
const mongoose = require('mongoose');
const Mailer = require('../services/mailer');

/**
 * Return admin page
 * @param req 
 * @param res 
 */
async function getAdminPage(req, res) {
    const { page }  = req.query;
    const storyboards = await Storyboard.getAll(page);

    res.render('admin_panel.ejs', {
        title: 'Admin Panel!',
        storyboards: storyboards,
        user: req.user,
        page: page,
        message: ''
    });
}

/**
 * Approve storyboard
 * @param req 
 * @param res 
 */
async function changeStoryboardStatus(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);
    try {
        const editedBy = req.user._id;
        const data = {
            status: req.body.action + 'd',
            editedBy
        }
        
        const res = await Storyboard.updateOne({ _id }, data);

        res.send(res);
    } catch ({ message }) {
        res.send({ message });
    }
}

module.exports = {
    getAdminPage,
    changeStoryboardStatus
};