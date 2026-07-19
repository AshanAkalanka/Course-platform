import { useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminFormModal from '../components/AdminFormModal';

const AdminNotifications = () => {
    const [form, setForm] = useState({ title: '', message: '', isUrgent: false });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

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
            setIsNotificationModalOpen(false);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page admin-workspace-page admin-notifications-page">
            <AdminPageHeader
                icon="notifications"
                eyebrow="Communication"
                title="Notification studio"
                description="Compose a clear platform update, preview it, and broadcast it to every registered user."
                tone="indigo"
            />

            <Alert type="success" message={message} />
            <Alert type="error" message={error} />

            <div className="admin-page-primary-action fade-up delay-1">
                <div><strong>Broadcast a platform update</strong><span>Compose and preview the message before sending it to every registered user.</span></div>
                <button type="button" className="btn-primary" onClick={() => { setForm({ title: '', message: '', isUrgent: false }); setError(''); setIsNotificationModalOpen(true); }}><MaterialIcon name="edit_notifications" /> Compose notification</button>
            </div>

            <div className="admin-communication-guide fade-up">
                <article><span><MaterialIcon name="visibility" /></span><div><strong>Preview before sending</strong><p>Check how the title, message, and urgency treatment will appear to users.</p></div></article>
                <article><span><MaterialIcon name="campaign" /></span><div><strong>Broadcast to everyone</strong><p>Notifications from this page are delivered to all registered accounts.</p></div></article>
            </div>

            <AdminFormModal
                open={isNotificationModalOpen}
                onClose={() => { if (!loading) { setIsNotificationModalOpen(false); setForm({ title: '', message: '', isUrgent: false }); setError(''); } }}
                icon="edit_notifications"
                eyebrow="Broadcast message"
                title="Compose notification"
                wide
                disableClose={loading}
            >
                <div className="admin-notification-layout admin-notification-modal-layout">
                    <div className="admin-form admin-notification-composer">
                    {error && <Alert type="error" message={error} />}
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

                    <label className="checkbox-label admin-urgent-toggle">
                        <input
                            type="checkbox"
                            name="isUrgent"
                            checked={form.isUrgent}
                            onChange={handleChange}
                        />
                        <span><strong>Mark as urgent</strong><small>Displays a high-priority alert to users.</small></span>
                    </label>

                    <div className="admin-form-actions">
                        <button type="button" className="btn-secondary" onClick={() => { setIsNotificationModalOpen(false); setForm({ title: '', message: '', isUrgent: false }); }} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            <MaterialIcon name="campaign" /> {loading ? 'Sending...' : 'Send Notification'}
                        </button>
                    </div>
                    </form>
                </div>

                <aside className={`admin-notification-preview${form.isUrgent ? ' urgent' : ''}`}>
                    <div className="admin-preview-heading"><span>Live preview</span><small>Recipient view</small></div>
                    <div className="admin-preview-card">
                        <span className="admin-preview-icon"><MaterialIcon name={form.isUrgent ? 'warning' : 'notifications'} /></span>
                        <div>
                            <small>{form.isUrgent ? 'Urgent announcement' : 'EduFlow update'}</small>
                            <h3>{form.title || 'Notification title'}</h3>
                            <p>{form.message || 'Your notification message will appear here as you type.'}</p>
                            <time>Just now</time>
                        </div>
                    </div>
                    <p className="admin-preview-note"><MaterialIcon name="info" /> This message will be sent to all registered users.</p>
                </aside>
                </div>
            </AdminFormModal>
        </div>
    );
};

export default AdminNotifications;
