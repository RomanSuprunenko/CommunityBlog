const express = require('express');
const authorization = require('../middlewares/authorization');
const userController = require('../controllers/user.controller');
const router = express.Router();

/**
 * Returns all users
 */
router.get('/', userController.getUsers);

/**
 * Get upload page.
 */
router.get('/upload', userController.getUploadPage);

/**
 * Sing up user
 */
router.post('/signup', userController.createUser);

/**
 * Get user profile page
 */
router.get('/profile', authorization, userController.getProfile);

/**
 * Returns specified user
 */
router.get('/:id', userController.getUserStoryboards);

/**
 * Delete user
 */
router.delete('/:id', authorization, userController.deleteUser);

/**
 * Get Reset user password page
 */
router.get('/reset_password/:id/:forgotPasswordHash', userController.getResetPasswordPage);

/**
 * Reset user password
 */
router.post('/reset_password', userController.resetPassword);

/**
 * Upload storyboarder. In progress
 */
router.post('/upload', authorization, userController.upload);

/**
 * Upload User profile image
 */
router.post('/upload-profile-image', authorization, userController.updateProfileImage)

/**
 * Confirm user's email
 */
router.get('/confirmation/:id/:emailConfirmationHash', authorization, userController.confirmEmail);

module.exports = router;
