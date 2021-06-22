const express = require('express');
const authorization = require('../middlewares/authorization');
const commentController = require('../controllers/comment.controller');
const router = express.Router();

/**
 * Create new comment
 */
router.post('/', authorization, commentController.createComment);

/**
 * Get all comments
 */
router.get('/', commentController.getComments);

/**
 * Get comment by id
 */
router.get('/:id', commentController.getComment);

/**
 * Edit comment by id
 */
router.patch('/:id', authorization, commentController.editComment);

/**
 * Delete comment
 */
router.delete('/:id', authorization, commentController.deleteComment);

/**
 * Like comment
 */
router.patch('/:id/like', authorization, commentController.likeComment);

/**
 * Dislike comment
 */
router.patch('/:id/dislike', authorization, commentController.dislikeComment);

module.exports = router;
