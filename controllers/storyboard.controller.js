
const { Storyboard, Comment } = require('../db/models/');
const Mailer = require('../services/mailer');
const mongoose = require('mongoose');
const moment = require('moment');

/**
 * Returns exact storyboard but Id
 * @param {*} req 
 * @param {*} res 
 */
async function getStoryboardById(req, res) {
    let id = mongoose.Types.ObjectId(req.params.id);

    console.log('id', id);
    if (!id) {
        return res.send({ message: 'Id is missing in params' });
    }

    try {
        let userStoryboards = [];
        const storyboard = await Storyboard.findById(id);
        
        if (req.user && req.user._id) userStoryboards = await Storyboard.find({ createdBy: req.user._id });

        console.log('userStoryboards', userStoryboards);

        if (storyboard) {
            const comments = await Comment.find({ storyboardId: storyboard._id });

            // res.send(storyboard);
            return res.render('storyboard.ejs', {
                title: 'storyboards!',
                storyboard: storyboard,
                userStoryboards: userStoryboards,
                comments: comments,
                user: req.user,
                moment: moment,
              })
        } else {
            return res.send({ message: 'Storyboard with id ' + id + ' was not found' });
        }
    } catch ({ message }) {
        return res.send({ message });
    }
}

/**
 * Returns all storyboards
 * @param {*} req 
 * @param {*} res 
 */
async function getStoryboards(req, res) {
    try {
        const storyboards = await Storyboard.find({ status: 'approved' });
        console.log('storyboards', storyboards);

        res.render('storyboards.ejs', {
            title: 'storyboards!',
            storyboards: storyboards,
            user: req.user
          });
    } catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Update storyboard
 * @param {*} req 
 * @param {*} res 
 */
async function editStoryboard(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);

    try {
        const editedBy = req.user._id;
        console.log('editedBy', editedBy);

        const data = {
            ...req.body,
            editedBy
        }
        const storyboard = await Storyboard.updateOne({ _id }, data);
        res.send(storyboard);
    } catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Delete storyboard
 * @param {*} req 
 * @param {*} res 
 */
async function deleteStoryboard(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);

    if (!_id) {
        return res.send({ message: 'Storyboard with id ' + _id + ' was not found' });
    }

    try {
        await Storyboard.remove({ _id });
        return res.send({
            data: { _id },
            message: 'Storyboard was successfully deleted'
        });
    } catch ({ message }) {
        return res.send({ message });
    }
}

/**
 * Set like to storyboard
 * @param {*} req 
 * @param {*} res 
 */
async function likeStoryboard(req, res) {
    let id = mongoose.Types.ObjectId(req.params.id);
    try {
        let storyboard = await Storyboard.findById(id);
        if (storyboard.likedBy.includes(req.user._id)) return res.send({ message: 'Storyboard with id ' + id + ' is already liked' });

        storyboard = await Storyboard.like(id, req.user._id);
        return res.send(storyboard);
    }
    catch ({ message }) {
        return res.send({ message });
    }
}

/**
 * Set dislike to storyboard
 * @param {*} req 
 * @param {*} res 
 */
async function dislikeStoryboard(req, res) {
    let id = mongoose.Types.ObjectId(req.params.id);
    try {
        let storyboard = await Storyboard.findById(id);
        if (storyboard.dislikedBy.includes(req.user._id)) return res.send({ message: 'Storyboard with id ' + id + ' is already disliked' });

        storyboard = await Storyboard.dislike(id);
        return res.send(storyboard);
    }
    catch ({ message }) {
        return res.send({ message });
    }
}

module.exports = {
    getStoryboardById,
    getStoryboards,
    editStoryboard,
    deleteStoryboard,
    likeStoryboard,
    dislikeStoryboard
};

