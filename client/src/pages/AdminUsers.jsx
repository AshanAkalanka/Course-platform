import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';

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

    return (
        <div className="page">
            <div className="page-header">
                <p className="eyebrow">Admin users</p>
                <h2>Manage users and platform access.</h2>
                <p className="page-subtitle">Update roles, review accounts, and remove users when needed.</p>
            </div>

            <Alert type="success" message={message} />
            <Alert type="error" message={errorMessage} />

            <div className="admin-table-wrapper fade-up">
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
