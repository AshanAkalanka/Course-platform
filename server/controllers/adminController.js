const pool = require('../config/db');
const { createNotification } = require('./notificationController');
const { isDefaultCategory, mergeWithDefaultCategories } = require('../config/defaultCategories');

// Compatible with all MySQL versions — checks INFORMATION_SCHEMA before altering
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
        // Ignore — column already exists or table not ready
    }
};

const ensureCategoriesTable = async () => {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

const getAdminStats = async (req, res) => {
    try {
        const [[users]] = await pool.execute('SELECT COUNT(*) AS totalUsers FROM users');
        const [[courses]] = await pool.execute('SELECT COUNT(*) AS totalCourses FROM courses');
        const [[enrollments]] = await pool.execute('SELECT COUNT(*) AS totalEnrollments FROM enrollments');

        res.json({
            totalUsers: users.totalUsers,
            totalCourses: courses.totalCourses,
            totalEnrollments: enrollments.totalEnrollments
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['student', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, req.params.id]
        );

        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user role' });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (Number(req.params.id) === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

const getCategories = async (req, res) => {
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

const createCategory = async (req, res) => {
    try {
        await ensureCategoriesTable();
        const name = req.body.name?.trim();

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        if (isDefaultCategory(name)) {
            return res.status(400).json({ message: 'This category is already included by default' });
        }

        await pool.execute(
            'INSERT INTO categories (name) VALUES (?)',
            [name]
        );

        res.status(201).json({ message: 'Category created successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Category already exists' });
        }

        res.status(500).json({ message: 'Failed to create category' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        await ensureCategoriesTable();
        const categoryName = decodeURIComponent(req.params.name);

        if (isDefaultCategory(categoryName)) {
            return res.status(400).json({ message: 'Default categories cannot be removed' });
        }

        const [courseRows] = await pool.execute(
            'SELECT id FROM courses WHERE category = ? LIMIT 1',
            [categoryName]
        );

        if (courseRows.length > 0) {
            return res.status(400).json({ message: 'Cannot delete a category that is assigned to a course' });
        }

        await pool.execute(
            'DELETE FROM categories WHERE name = ?',
            [categoryName]
        );

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete category' });
    }
};

const getPendingEnrollments = async (req, res) => {
    try {
        await ensureEnrollmentStatus();
        const [rows] = await pool.execute(
            `SELECT e.id, e.status, e.user_id, e.course_id,
                    u.name AS user_name, u.email AS user_email,
                    c.title AS course_title
             FROM enrollments e
             JOIN users u ON e.user_id = u.id
             JOIN courses c ON e.course_id = c.id
             ORDER BY e.id DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('getPendingEnrollments error:', error);
        res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
};

const approveEnrollment = async (req, res) => {
    try {
        await ensureEnrollmentStatus();
        const { id } = req.params;

        // Get user_id and course title before updating
        const [rows] = await pool.execute(
            `SELECT e.user_id, c.title AS course_title
             FROM enrollments e
             JOIN courses c ON e.course_id = c.id
             WHERE e.id = ?`,
            [id]
        );

        await pool.execute("UPDATE enrollments SET status = 'approved' WHERE id = ?", [id]);

        if (rows.length > 0) {
            await createNotification(
                rows[0].user_id,
                '✅ Enrollment Approved',
                `Your enrollment request for "${rows[0].course_title}" has been approved. You can now access the course.`
            );
        }

        res.json({ message: 'Enrollment approved' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve enrollment' });
    }
};

const rejectEnrollment = async (req, res) => {
    try {
        await ensureEnrollmentStatus();
        const { id } = req.params;

        const [rows] = await pool.execute(
            `SELECT e.user_id, c.title AS course_title
             FROM enrollments e
             JOIN courses c ON e.course_id = c.id
             WHERE e.id = ?`,
            [id]
        );

        await pool.execute("UPDATE enrollments SET status = 'rejected' WHERE id = ?", [id]);

        if (rows.length > 0) {
            await createNotification(
                rows[0].user_id,
                '❌ Enrollment Rejected',
                `Your enrollment request for "${rows[0].course_title}" was not approved. Please contact support if you believe this is a mistake.`
            );
        }

        res.json({ message: 'Enrollment rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject enrollment' });
    }
};

module.exports = {
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
};
