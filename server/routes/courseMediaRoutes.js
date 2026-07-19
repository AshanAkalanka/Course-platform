const express = require('express');
const router = express.Router();
const { getMaterials, uploadMaterial, deleteMaterial } = require('../controllers/courseMediaController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const courseMaterialUpload = require('../middleware/courseMaterialUpload');

// Public: enrolled users can view materials
router.get('/:courseId', authMiddleware, getMaterials);

// Admin only: upload and delete
router.post('/:courseId', authMiddleware, roleMiddleware('admin'), courseMaterialUpload.single('file'), uploadMaterial);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteMaterial);

module.exports = router;
