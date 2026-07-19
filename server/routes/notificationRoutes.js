const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, adminCreateNotification } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getNotifications);
router.put('/:id/read', authMiddleware, markAsRead);
router.put('/read-all', authMiddleware, markAllAsRead);
router.post('/admin', authMiddleware, roleMiddleware('admin'), adminCreateNotification);

module.exports = router;
