
const { Comment } = require('../db/models');
const Mailer = require('../services/mailer');
const mongoose = require('mongoose');

/**
 * Returns exact comment
 * @param {*} req 
 * @param {*} res 
 */
async function getComment(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);

    if (!_id) {
        return res.send({ message: 'Id is missing in params' });
    }

    try {
        const comment = await Comment.findOne({ _id });
        if (comment) {
            return res.send(comment);
        } else {
            return res.send({ message: 'Comment with id ' + _id + ' was not found' });
        }
    } catch ({ message }) {
        return res.send({ message });
    }
}

/**
 * Returns all comments
 * @param {*} req 
 * @param {*} res 
 */
async function getComments(req, res) {
    try {
        const comments = await Comment.find({});
        res.send(comments);
    } catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Returns all comments for exact storyboard
 * @param {*} req 
 * @param {*} res 
 */
async function getCommentsByStoryboardId(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);

    try {
        const comments = await Comment.find({ storyboardId: _id });
        res.send(comments);
    } catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Create comment
 * @param {*} req 
 * @param {*} res 
 */
async function createComment(req, res) {
    try {
        const createdBy = req.user._id;
        const displayName = req.user.displayName;
        const data = {
            ...req.body,
            displayName,
            createdBy
        }
        const comment = await Comment.create({ ...data });
        Mailer.comment(req.user.email, comment.text, comment.storyboardId);

        res.redirect('/storyboards/' + comment.storyboardId)
    } catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Update comment
 * @param {*} req 
 * @param {*} res 
 */
async function editComment(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);

    try {
        const editedBy = req.user._id;
        const data = {
            ...req.text,
            editedBy
        }
        const comment = await Comment.updateOne({ _id }, data);;
        res.send(comment);
    } catch ({ message }) {
        res.send({ message });
    }
}

/**
 * Delete comment
 * @param {*} req 
 * @param {*} res 
 */
async function deleteComment(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);

    if (!_id) {
        return res.send({ message: 'Comment with id ' + _id + ' was not found' });
    }

    try {
        await Comment.remove({ _id });
        return res.send({
            data: { _id },
            message: 'Comment was successfully deleted'
        })
    } catch ({ message }) {
        return res.send({ message });
    }
}

/**
 * Set like to comment
 * @param {*} req 
 * @param {*} res 
 */
async function likeComment(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);

    try {
        let comment = await Comment.findOne({ _id });
        if (comment.likedBy.includes(req.user._id)) return res.send({ message: 'Comment with id ' + _id + ' is already liked' });

        comment = await Comment.like(_id);
        return res.send(comment);
    }
    catch ({ message }) {
        return res.send({ message });
    }
}

/**
 * Set dislike to comment
 * @param {*} req 
 * @param {*} res 
 */
async function dislikeComment(req, res) {
    let _id = mongoose.Types.ObjectId(req.params.id);

    try {
        let comment = await Comment.findOne({ _id });
        if (comment.dislikedBy.includes(req.user._id)) return res.send({ message: 'Comment with id ' + _id + ' is already disliked' });

        comment = await Comment.dislike(_id);
        return res.send(comment);
    }
    catch ({ message }) {
        return res.send({ message });
    }
}

module.exports = {
    getComment,
    getComments,
    getCommentsByStoryboardId,
    createComment,
    editComment,
    deleteComment,
    likeComment,
    dislikeComment
};

