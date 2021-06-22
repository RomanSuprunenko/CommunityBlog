const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

/**
 * Login into the system
 */
router.post('/login', authController.login);

/**
 * Log out user from the system
 */
router.get('/logout', authController.logout);

/**
 * Get login page
 */
router.get('/login', authController.getLoginPage);

/**
 * Get forgot page
 */
router.get('/forgot', authController.getForgotPage);

/**
 * Get singup page
 */
router.get('/signup', authController.getSignupPage);

/**
 * Send userdata for access recover
 */
router.post('/forgot', authController.forgotPassword);

module.exports = router;
