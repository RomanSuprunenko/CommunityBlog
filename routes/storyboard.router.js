const express = require('express');
const authorization = require('../middlewares/authorization');
const storyboardController = require('../controllers/storyboard.controller');
const router = express.Router();

/**
 * Get all Storyboards
 */
router.get('/', storyboardController.getStoryboards);

/**
 * Get Storyboard by id
 */
router.get('/:id', storyboardController.getStoryboardById);

/**
 * Edit Storyboard by id
 */
router.patch('/:id', authorization, storyboardController.editStoryboard);

/**
 * Delete Storyboard
 */
router.delete('/:id', authorization, storyboardController.deleteStoryboard);

/**
 * Like Storyboard
 */
router.post('/:id/like', authorization, storyboardController.likeStoryboard);

/**
 * Dislike Storyboard
 */
router.post('/:id/dislike', authorization, storyboardController.dislikeStoryboard);

module.exports = router;
