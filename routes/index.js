const express = require('express');
const authRoutes = require('./auth.router');
const userRoutes = require('./user.router');
const storyboardRoutes = require('./storyboard.router');
const commentRoutes = require('./comment.router');
const settingsRoutes = require('./settings.router');
const adminRoutes = require('./admin.router');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/storyboarders', userRoutes);
router.use('/storyboards', storyboardRoutes);
router.use('/comments', commentRoutes);
router.use('/settings', settingsRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
