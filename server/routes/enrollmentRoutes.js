const express = require('express');
const router = express.Router();
const { enrollInCourse, getMyCourses, getMyEnrollmentStatuses } = require('../controllers/enrollmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, enrollInCourse);
router.get('/my-courses', authMiddleware, getMyCourses);
router.get('/my-statuses', authMiddleware, getMyEnrollmentStatuses);

module.exports = router;