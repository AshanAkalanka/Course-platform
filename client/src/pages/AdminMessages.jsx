import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/contact');
            setMessages(res.data);
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

    return (
        <div className="page">
            <div className="page-header fade-up">
                <p className="eyebrow">Admin</p>
                <h1>Contact Messages {unread > 0 && <span className="msg-unread-badge">{unread} new</span>}</h1>
                <p className="page-subtitle">View and manage messages submitted through the contact form.</p>
            </div>

            <Alert type="error" message={error} />

            {loading && <div className="loading-panel" />}

            {!loading && messages.length === 0 && (
                <div className="empty-state">No messages yet.</div>
            )}

            {!loading && messages.length > 0 && (
                <div className="messages-layout fade-up">
                    {/* Message List */}
                    <div className="messages-list">
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

                    {/* Message Detail */}
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
