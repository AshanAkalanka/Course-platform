import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';
import AdminPageHeader from '../components/AdminPageHeader';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await api.get('/admin/users');
                setUsers(res.data);
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };

        void loadUsers();
    }, []);

    const changeRole = async (id, role) => {
        try {
            await api.put(`/admin/users/${id}/role`, { role });
            setMessage('User role updated successfully');
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        }
    };

    const deleteUser = async (id) => {
        const confirmDelete = window.confirm('Delete this user?');
        if (!confirmDelete) return;

        try {
            await api.delete(`/admin/users/${id}`);
            setMessage('User deleted successfully');
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        }
    };

    const adminCount = users.filter((user) => user.role === 'admin').length;
    const studentCount = users.filter((user) => user.role === 'student').length;

    return (
        <div className="page admin-workspace-page admin-users-page">
            <AdminPageHeader
                icon="group"
                eyebrow="People and access"
                title="User directory"
                description="Review accounts, change access roles, and manage the people using EduFlow."
                tone="amber"
            />

            <div className="admin-page-metrics fade-up" aria-label="User account summary">
                <article><span className="blue"><MaterialIcon name="groups" /></span><div><strong>{users.length}</strong><small>Total accounts</small></div></article>
                <article><span className="green"><MaterialIcon name="school" /></span><div><strong>{studentCount}</strong><small>Students</small></div></article>
                <article><span className="amber"><MaterialIcon name="admin_panel_settings" /></span><div><strong>{adminCount}</strong><small>Administrators</small></div></article>
            </div>

            <Alert type="success" message={message} />
            <Alert type="error" message={errorMessage} />

            <div className="admin-table-wrapper admin-data-panel fade-up">
                <div className="admin-section-title">
                    <div><span><MaterialIcon name="manage_accounts" /></span><div><h3>Account access</h3><p>Role changes are applied immediately.</p></div></div>
                    <strong>{users.length} users</strong>
                </div>
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <select
                                    value={user.role}
                                    onChange={(e) => changeRole(user.id, e.target.value)}
                                >
                                    <option value="student">student</option>
                                    <option value="admin">admin</option>
                                </select>
                            </td>
                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            <td>
                                <button
                                    className="btn-small delete-btn"
                                    onClick={() => deleteUser(user.id)}
                                >
                                    <MaterialIcon name="person_remove" /> Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {loading && <div className="loading-panel" style={{ marginTop: '20px' }}></div>}
                {!loading && users.length === 0 && (
                    <div className="empty-state" style={{ marginTop: '20px' }}>No users found.</div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
