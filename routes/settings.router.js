const express = require('express');
const authorization = require('../middlewares/authorization');
const settingsController = require('../controllers/settings.controller');
const router = express.Router();

/**
 * Redirect to default settings route
 */
router.get('/', authorization, (req, res) => {
    res.redirect('/profile');
});

/**
 * Get user profile page
 */
router.get('/profile', authorization, settingsController.getProfilePage);

/**
 * Get user email page
 */
router.get('/email', authorization, settingsController.getEmailPage);

/**
 * Get user avatar page
 */
router.get('/images', authorization, settingsController.getImagesPage);

/**
 * Get user avatar page
 */
router.get('/password', authorization, settingsController.getPasswordPage);

/**
 * Update user data
 */
router.post('/profile', authorization, settingsController.editUser);

module.exports = router;
