const pool = require('../config/db');

const ensureMaterialsTable = async () => {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS course_materials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            type ENUM('pdf','video','image','notice','message') NOT NULL,
            title VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) DEFAULT NULL,
            content TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

const getMaterials = async (req, res) => {
    try {
        await ensureMaterialsTable();
        const { courseId } = req.params;
        const [rows] = await pool.execute(
            'SELECT * FROM course_materials WHERE course_id = ? ORDER BY created_at DESC',
            [courseId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch materials' });
    }
};

const uploadMaterial = async (req, res) => {
    try {
        await ensureMaterialsTable();
        const { courseId } = req.params;
        const { type, title, content } = req.body;

        if (!type || !title) {
            return res.status(400).json({ message: 'Type and title are required' });
        }

        const validTypes = ['pdf', 'video', 'image', 'notice', 'message'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Invalid material type' });
        }

        const filePath = req.file ? `/uploads/materials/${req.file.filename}` : null;

        if (['pdf', 'video', 'image'].includes(type) && !filePath) {
            return res.status(400).json({ message: 'File is required for this type' });
        }

        if (['notice', 'message'].includes(type) && !content) {
            return res.status(400).json({ message: 'Content is required for notice/message' });
        }

        await pool.execute(
            'INSERT INTO course_materials (course_id, type, title, file_path, content) VALUES (?, ?, ?, ?, ?)',
            [courseId, type, title, filePath, content || null]
        );

        res.status(201).json({ message: 'Material uploaded successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to upload material' });
    }
};

const deleteMaterial = async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const { id } = req.params;

        const [rows] = await pool.execute('SELECT file_path FROM course_materials WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Material not found' });

        const filePath = rows[0].file_path;
        if (filePath) {
            const absPath = path.join(__dirname, '..', filePath);
            if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
        }

        await pool.execute('DELETE FROM course_materials WHERE id = ?', [id]);
        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete material' });
    }
};

module.exports = { getMaterials, uploadMaterial, deleteMaterial };
