import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';
import AdminPageHeader from '../components/AdminPageHeader';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/contact');
            setMessages(res.data);
            setSelected((current) => current || res.data[0] || null);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMessages(); }, []);

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/contact/${id}/read`);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
            if (selected?.id === id) setSelected(prev => ({ ...prev, is_read: true }));
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this message?')) return;
        try {
            await api.delete(`/contact/${id}`);
            setMessages(prev => prev.filter(m => m.id !== id));
            if (selected?.id === id) setSelected(null);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const unread = messages.filter(m => !m.is_read).length;
    const read = messages.length - unread;

    return (
        <div className="page admin-workspace-page admin-messages-page">
            <AdminPageHeader
                icon="mail"
                eyebrow="Communication"
                title="Contact inbox"
                description="Read messages from visitors, track unread requests, and keep the inbox tidy."
                badge={unread > 0 ? <span className="msg-unread-badge">{unread} new</span> : null}
                tone="rose"
            />

            <div className="admin-page-metrics fade-up" aria-label="Message inbox summary">
                <article><span className="blue"><MaterialIcon name="inbox" /></span><div><strong>{messages.length}</strong><small>Total messages</small></div></article>
                <article><span className="rose"><MaterialIcon name="mark_email_unread" /></span><div><strong>{unread}</strong><small>Unread</small></div></article>
                <article><span className="green"><MaterialIcon name="mark_email_read" /></span><div><strong>{read}</strong><small>Read</small></div></article>
            </div>

            <Alert type="error" message={error} />

            {loading && <div className="loading-panel" />}

            {!loading && messages.length === 0 && (
                <div className="empty-state">No messages yet.</div>
            )}

            {!loading && messages.length > 0 && (
                <div className="messages-layout admin-inbox-layout fade-up">
                    <div className="messages-list">
                        <div className="admin-inbox-heading"><span>Inbox</span><strong>{messages.length}</strong></div>
                        {messages.map(msg => (
                            <button
                                key={msg.id}
                                className={`message-item${selected?.id === msg.id ? ' message-item-active' : ''}${!msg.is_read ? ' message-item-unread' : ''}`}
                                onClick={() => { setSelected(msg); if (!msg.is_read) handleMarkRead(msg.id); }}
                            >
                                <div className="message-item-top">
                                    <span className="message-sender">{msg.name}</span>
                                    <span className="message-date">{new Date(msg.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="message-subject">{msg.subject}</div>
                                <div className="message-preview">{msg.email}</div>
                            </button>
                        ))}
                    </div>

                    <div className="message-detail glass-card">
                        {selected ? (
                            <>
                                <div className="message-detail-header">
                                    <div>
                                        <h2 className="message-detail-subject">{selected.subject}</h2>
                                        <p className="message-detail-meta">
                                            From <strong>{selected.name}</strong> &lt;{selected.email}&gt; ·{' '}
                                            {new Date(selected.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="message-detail-actions">
                                        {!selected.is_read && (
                                            <button className="btn-secondary btn-small" onClick={() => handleMarkRead(selected.id)}>
                                                <MaterialIcon name="mark_email_read" /> Mark Read
                                            </button>
                                        )}
                                        <button className="btn-ghost btn-small" onClick={() => handleDelete(selected.id)}>
                                            <MaterialIcon name="delete" /> Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="message-detail-body">{selected.message}</div>
                            </>
                        ) : (
                            <div className="message-detail-empty">
                                <p>Select a message to read it.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMessages;
