const pool = require('../config/db');

// Compatible with all MySQL versions
const ensureEnrollmentStatus = async () => {
    try {
        const [cols] = await pool.execute(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME   = 'enrollments'
              AND COLUMN_NAME  = 'status'
        `);
        if (cols.length === 0) {
            await pool.execute(`
                ALTER TABLE enrollments
                ADD COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'
            `);
        }
    } catch (_) {
        // Safe to ignore
    }
};

const enrollInCourse = async (req, res) => {
    try {
        await ensureEnrollmentStatus();
        const userId = req.user.id;
        const { course_id } = req.body;

        if (!course_id) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        const [courseRows] = await pool.execute(
            'SELECT id FROM courses WHERE id = ?',
            [course_id]
        );

        if (courseRows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const [existingRows] = await pool.execute(
            'SELECT id, status FROM enrollments WHERE user_id = ? AND course_id = ?',
            [userId, course_id]
        );

        if (existingRows.length > 0) {
            const status = existingRows[0].status;
            if (status === 'pending') return res.status(400).json({ message: 'Enrollment request already pending' });
            if (status === 'approved') return res.status(400).json({ message: 'Already enrolled' });
            if (status === 'rejected') {
                // Allow re-requesting after rejection
                await pool.execute(
                    "UPDATE enrollments SET status = 'pending' WHERE user_id = ? AND course_id = ?",
                    [userId, course_id]
                );
                return res.status(201).json({ message: 'Enrollment request re-submitted. Awaiting admin approval.' });
            }
        }

        await pool.execute(
            "INSERT INTO enrollments (user_id, course_id, status) VALUES (?, ?, 'pending')",
            [userId, course_id]
        );

        res.status(201).json({ message: 'Enrollment request submitted. Awaiting admin approval.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Already enrolled' });
        }
        res.status(500).json({ message: 'Enrollment failed' });
    }
};

const getMyCourses = async (req, res) => {
    try {
        await ensureEnrollmentStatus();
        const [rows] = await pool.execute(
            `SELECT c.*, e.status AS enrollment_status
             FROM enrollments e
             JOIN courses c ON e.course_id = c.id
             WHERE e.user_id = ? AND e.status = 'approved'`,
            [req.user.id]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch enrolled courses' });
    }
};

const getMyEnrollmentStatuses = async (req, res) => {
    try {
        await ensureEnrollmentStatus();
        const [rows] = await pool.execute(
            'SELECT course_id, status FROM enrollments WHERE user_id = ?',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch enrollment statuses' });
    }
};

module.exports = { enrollInCourse, getMyCourses, getMyEnrollmentStatuses };
