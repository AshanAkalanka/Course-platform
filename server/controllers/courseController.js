const pool = require('../config/db');
const { mergeWithDefaultCategories } = require('../config/defaultCategories');

const ensureCategoriesTable = async () => {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

const getCourses = async (req, res) => {
    try {
        const { search = '', category = '', level = '' } = req.query;

        let query = 'SELECT * FROM courses WHERE 1=1';
        const values = [];

        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            values.push(`%${search}%`, `%${search}%`);
        }

        if (category) {
            query += ' AND category = ?';
            values.push(category);
        }

        if (level) {
            query += ' AND level = ?';
            values.push(level);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.execute(query, values);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch courses' });
    }
};

const getCourseById = async (req, res) => {
    try {
        const [courseRows] = await pool.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);

        if (courseRows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const [lessonRows] = await pool.execute(
            'SELECT * FROM lessons WHERE course_id = ? ORDER BY lesson_order ASC',
            [req.params.id]
        );

        res.json({
            ...courseRows[0],
            lessons: lessonRows
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch course' });
    }
};

const getCourseCategories = async (req, res) => {
    try {
        await ensureCategoriesTable();

        const [rows] = await pool.execute(
            `SELECT name FROM categories
             UNION
             SELECT DISTINCT category AS name FROM courses WHERE category IS NOT NULL AND category <> ''
             ORDER BY name ASC`
        );

        res.json(mergeWithDefaultCategories(rows.map((row) => row.name)));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
};

const createCourse = async (req, res) => {
    try {
        const { title, description, category, level } = req.body;
        const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const [result] = await pool.execute(
            `INSERT INTO courses (title, description, thumbnail, category, level, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [title, description, thumbnail, category || null, level || null, req.user.id]
        );

        res.status(201).json({
            message: 'Course created successfully',
            courseId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create course' });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { title, description, category, level } = req.body;

        const [existingRows] = await pool.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const existing = existingRows[0];
        const thumbnail = req.file ? `/uploads/${req.file.filename}` : existing.thumbnail;

        await pool.execute(
            `UPDATE courses
             SET title = ?, description = ?, thumbnail = ?, category = ?, level = ?
             WHERE id = ?`,
            [
                title || existing.title,
                description || existing.description,
                thumbnail,
                category || existing.category,
                level || existing.level,
                req.params.id
            ]
        );

        res.json({ message: 'Course updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update course' });
    }
};

const deleteCourse = async (req, res) => {
    try {
        await pool.execute('DELETE FROM courses WHERE id = ?', [req.params.id]);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete course' });
    }
};

module.exports = {
    getCourses,
    getCourseById,
    getCourseCategories,
    createCourse,
    updateCourse,
    deleteCourse
};
