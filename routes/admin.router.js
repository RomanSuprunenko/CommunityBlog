const express = require('express');
const authorization = require('../middlewares/authorization');
const adminController = require('../controllers/admin.controller');
const router = express.Router();

/**
 * Get admin page
 */
router.get('/', authorization, adminController.getAdminPage);

/**
 * Approve storyboard
 */
router.post('/change_status/:id', authorization, adminController.changeStoryboardStatus);

module.exports = router;
