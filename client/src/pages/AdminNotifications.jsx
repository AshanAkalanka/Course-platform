import { useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';

const AdminNotifications = () => {
    const [form, setForm] = useState({ title: '', message: '', isUrgent: false });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            await api.post('/notifications/admin', form);
            setMessage('Notification successfully broadcasted to all users.');
            setForm({ title: '', message: '', isUrgent: false });
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page fade-up">
            <div className="page-header">
                <p className="eyebrow">Admin</p>
                <h2>Send Notifications</h2>
                <p className="page-subtitle">Broadcast messages or alerts to all registered users.</p>
            </div>

            <Alert type="success" message={message} />
            <Alert type="error" message={error} />

            <div className="admin-form fade-up delay-1">
                <h3>New Notification</h3>
                <form onSubmit={handleSubmit} className="notif-admin-form">
                    <input
                        type="text"
                        name="title"
                        placeholder="Notification Title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="notif-input"
                    />

                    <textarea
                        name="message"
                        placeholder="Notification Message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="notif-input"
                    ></textarea>

                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name="isUrgent"
                            checked={form.isUrgent}
                            onChange={handleChange}
                        />
                        <span style={{ fontWeight: 600, color: form.isUrgent ? '#e53e3e' : 'inherit' }}>
                            Mark as Urgent (Red Alert)
                        </span>
                    </label>

                    <div className="admin-form-actions" style={{ marginTop: '20px' }}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            <MaterialIcon name="campaign" /> {loading ? 'Sending...' : 'Send Notification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminNotifications;
