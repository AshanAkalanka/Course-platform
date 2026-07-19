const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getCategories,
    createCategory,
    deleteCategory,
    getPendingEnrollments,
    approveEnrollment,
    rejectEnrollment
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/stats', authMiddleware, roleMiddleware('admin'), getAdminStats);
router.get('/users', authMiddleware, roleMiddleware('admin'), getAllUsers);
router.put('/users/:id/role', authMiddleware, roleMiddleware('admin'), updateUserRole);
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), deleteUser);
router.get('/categories', authMiddleware, roleMiddleware('admin'), getCategories);
router.post('/categories', authMiddleware, roleMiddleware('admin'), createCategory);
router.delete('/categories/:name', authMiddleware, roleMiddleware('admin'), deleteCategory);
router.get('/enrollments', authMiddleware, roleMiddleware('admin'), getPendingEnrollments);
router.put('/enrollments/:id/approve', authMiddleware, roleMiddleware('admin'), approveEnrollment);
router.put('/enrollments/:id/reject', authMiddleware, roleMiddleware('admin'), rejectEnrollment);

module.exports = router;
