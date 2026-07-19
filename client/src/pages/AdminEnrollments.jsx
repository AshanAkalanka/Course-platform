import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';

const FILTER_ICONS = { all: 'filter_list', pending: 'pending', approved: 'check_circle', rejected: 'cancel' };

const STATUS_COLORS = {
    pending: { background: '#fef9c3', color: '#854d0e' },
    approved: { background: '#dcfce7', color: '#166534' },
    rejected: { background: '#fee2e2', color: '#991b1b' }
};

const AdminEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchEnrollments = async () => {
        try {
            const res = await api.get('/admin/enrollments');
            setEnrollments(res.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEnrollments(); }, []);

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/enrollments/${id}/approve`);
            setMessage('Enrollment approved.');
            setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e));
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/admin/enrollments/${id}/reject`);
            setMessage('Enrollment rejected.');
            setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e));
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const filtered = filter === 'all' ? enrollments : enrollments.filter(e => e.status === filter);
    const pendingCount = enrollments.filter(e => e.status === 'pending').length;

    return (
        <div className="page">
            <div className="page-header fade-up">
                <p className="eyebrow">Admin</p>
                <h2>Enrollment Requests {pendingCount > 0 && <span className="msg-unread-badge">{pendingCount} pending</span>}</h2>
                <p className="page-subtitle">Review and approve or reject student enrollment requests for each course.</p>
            </div>

            <Alert type="success" message={message} />
            <Alert type="error" message={error} />

            <div className="filter-bar fade-up" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', display: 'flex', flexWrap: 'wrap' }}>
                {['all', 'pending', 'approved', 'rejected'].map(s => (
                    <button
                        key={s}
                        className={filter === s ? 'btn-primary btn-small' : 'btn-ghost btn-small'}
                        onClick={() => setFilter(s)}
                        style={{ textTransform: 'capitalize' }}
                    >
                        <MaterialIcon name={FILTER_ICONS[s]} /> {s}
                    </button>
                ))}
            </div>

            {loading && <div className="loading-panel" style={{ marginTop: '24px' }} />}

            {!loading && filtered.length === 0 && (
                <div className="empty-state">No enrollment requests found.</div>
            )}

            {!loading && filtered.length > 0 && (
                <div className="admin-table-wrapper fade-up">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student</th>
                                <th>Email</th>
                                <th>Course</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(enr => (
                                <tr key={enr.id}>
                                    <td>{enr.id}</td>
                                    <td><strong>{enr.user_name}</strong></td>
                                    <td>{enr.user_email}</td>
                                    <td>{enr.course_title}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '999px',
                                            fontSize: '0.82rem',
                                            fontWeight: 700,
                                            textTransform: 'capitalize',
                                            ...STATUS_COLORS[enr.status]
                                        }}>
                                            {enr.status}
                                        </span>
                                    </td>
                                    <td className="table-actions">
                                        {enr.status !== 'approved' && (
                                            <button className="btn-small edit-btn" onClick={() => handleApprove(enr.id)}>
                                                <MaterialIcon name="check_circle" /> Approve
                                            </button>
                                        )}
                                        {enr.status !== 'rejected' && (
                                            <button className="btn-small delete-btn" onClick={() => handleReject(enr.id)}>
                                                <MaterialIcon name="cancel" /> Reject
                                            </button>
                                        )}
                                        {enr.status === 'approved' && enr.status !== 'rejected' && (
                                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>–</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminEnrollments;
