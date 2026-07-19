import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        totalEnrollments: 0
    });
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };
        void fetchStats();
    }, []);

    return (
        <div className="page">
            <div className="page-header fade-up">
                <p className="eyebrow">Admin overview</p>
                <h2>Monitor the platform and manage course operations from one workspace.</h2>
                <p className="page-subtitle">
                    Review platform activity, manage courses, and keep lessons and users organized.
                </p>
            </div>

            <Alert type="error" message={errorMessage} />

            <div className="stats-grid">
                <div className="stat-card fade-up">
                    <h3>{stats.totalUsers}</h3>
                    <p>Total Users</p>
                </div>
                <div className="stat-card fade-up">
                    <h3>{stats.totalCourses}</h3>
                    <p>Total Courses</p>
                </div>
                <div className="stat-card fade-up">
                    <h3>{stats.totalEnrollments}</h3>
                    <p>Total Enrollments</p>
                </div>
            </div>

            <div className="admin-links-grid">
                <Link to="/admin/courses" className="admin-link-card fade-up">
                    <h3>Manage Courses</h3>
                    <p>Create, edit, delete courses</p>
                </Link>

                <Link to="/admin/lessons" className="admin-link-card fade-up">
                    <h3>Manage Lessons</h3>
                    <p>Add and edit lessons</p>
                </Link>

                <Link to="/admin/users" className="admin-link-card fade-up">
                    <h3>Manage Users</h3>
                    <p>View users, change roles, delete accounts</p>
                </Link>

                <Link to="/admin/messages" className="admin-link-card fade-up">
                    <h3>Messages</h3>
                    <p>View and respond to contact form submissions</p>
                </Link>

                <Link to="/admin/enrollments" className="admin-link-card fade-up">
                    <h3>Enrollment Requests</h3>
                    <p>Approve or reject student enrollment requests</p>
                </Link>

                <Link to="/admin/materials" className="admin-link-card fade-up">
                    <h3>Course Materials</h3>
                    <p>Upload PDFs, videos, images, notices &amp; messages per course</p>
                </Link>
            </div>

            {loading && <div className="loading-panel" style={{ marginTop: '24px' }}></div>}
        </div>
    );
};

export default AdminDashboard;
