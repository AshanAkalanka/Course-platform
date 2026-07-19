const pool = require('../config/db');

const ensureNotificationsTable = async () => {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                is_read TINYINT(1) NOT NULL DEFAULT 0,
                is_urgent TINYINT(1) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration for existing tables
        const [cols] = await pool.execute(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME   = 'notifications'
              AND COLUMN_NAME  = 'is_urgent'
        `);
        if (cols.length === 0) {
            await pool.execute(`
                ALTER TABLE notifications
                ADD COLUMN is_urgent TINYINT(1) NOT NULL DEFAULT 0
            `);
        }
    } catch (_) {
        // Ignore
    }
};

const getNotifications = async (req, res) => {
    try {
        await ensureNotificationsTable();
        const [rows] = await pool.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

const markAsRead = async (req, res) => {
    try {
        await pool.execute(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark notification' });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await pool.execute(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [req.user.id]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark notifications' });
    }
};

const createNotification = async (userId, title, message, isUrgent = 0) => {
    try {
        await ensureNotificationsTable();
        await pool.execute(
            'INSERT INTO notifications (user_id, title, message, is_urgent) VALUES (?, ?, ?, ?)',
            [userId, title, message, isUrgent ? 1 : 0]
        );
    } catch (_) {
        // Non-blocking — don't throw
    }
};

const adminCreateNotification = async (req, res) => {
    try {
        const { title, message, isUrgent, targetUserId } = req.body;
        await ensureNotificationsTable();

        if (targetUserId) {
            await pool.execute(
                'INSERT INTO notifications (user_id, title, message, is_urgent) VALUES (?, ?, ?, ?)',
                [targetUserId, title, message, isUrgent ? 1 : 0]
            );
        } else {
            // Broadcast to all users
            const [users] = await pool.execute('SELECT id FROM users');
            if (users.length > 0) {
                const values = users.map(u => `(${u.id}, ${pool.escape(title)}, ${pool.escape(message)}, ${isUrgent ? 1 : 0})`).join(',');
                await pool.execute(`INSERT INTO notifications (user_id, title, message, is_urgent) VALUES ${values}`);
            }
        }

        res.status(201).json({ message: 'Notification sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send notification' });
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification, adminCreateNotification };
