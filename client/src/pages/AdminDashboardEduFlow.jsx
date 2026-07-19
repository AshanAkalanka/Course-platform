import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';

const AdminDashboardEduFlow = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0 });
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };
        void fetchStats();
    }, []);

    const statItems = [
        { icon: 'group', value: stats.totalUsers, label: 'Total learners', detail: 'Registered accounts', tone: 'blue' },
        { icon: 'auto_stories', value: stats.totalCourses, label: 'Active courses', detail: 'Published catalog', tone: 'purple' },
        { icon: 'school', value: stats.totalEnrollments, label: 'Enrollments', detail: 'Learning journeys', tone: 'green' }
    ];

    const quickLinks = [
        { to: '/admin/courses', icon: 'auto_stories', title: 'Manage courses', copy: 'Create, edit, and organize the course catalog.' },
        { to: '/admin/lessons', icon: 'list_alt', title: 'Manage lessons', copy: 'Build structured lesson paths for every course.' },
        { to: '/admin/enrollments', icon: 'school', title: 'Enrollment requests', copy: 'Approve or review student access requests.' },
        { to: '/admin/users', icon: 'manage_accounts', title: 'Manage users', copy: 'Review accounts, permissions, and user roles.' },
        { to: '/admin/materials', icon: 'folder_open', title: 'Course materials', copy: 'Upload learning files and supporting content.' },
        { to: '/admin/messages', icon: 'mail', title: 'Student messages', copy: 'Read and manage support conversations.' }
    ];

    return (
        <div className="page admin-overview-page">
            <section className="admin-welcome fade-up">
                <div>
                    <p className="eyebrow">Admin overview</p>
                    <h1>Good to see you.<br /><span>Here’s what’s happening.</span></h1>
                    <p>Monitor learning activity, organize content, and keep EduFlow moving from one clear workspace.</p>
                </div>
                <div className="admin-welcome-art" aria-hidden="true">
                    <span>EF</span><i /><b />
                </div>
            </section>

            <Alert type="error" message={errorMessage} />

            <section className="admin-stats-grid" aria-label="Platform statistics">
                {statItems.map((item) => (
                    <article className="admin-stat-card fade-up" key={item.label}>
                        <span className={`admin-stat-icon ${item.tone}`}><MaterialIcon name={item.icon} /></span>
                        <div><small>{item.label}</small><strong>{loading ? '—' : item.value}</strong><p>{item.detail}</p></div>
                    </article>
                ))}
            </section>

            <section className="admin-overview-grid admin-overview-single">
                <div className="admin-quick-panel">
                    <div className="admin-section-heading">
                        <div><p className="eyebrow">Management</p><h2>Quick actions</h2></div>
                        <small>Choose an area to manage</small>
                    </div>
                    <div className="admin-action-grid">
                        {quickLinks.map((item) => (
                            <Link to={item.to} className="admin-action-card" key={item.to}>
                                <span><MaterialIcon name={item.icon} /></span>
                                <div><strong>{item.title}</strong><p>{item.copy}</p></div>
                                <b aria-hidden="true"><MaterialIcon name="arrow_forward" /></b>
                            </Link>
                        ))}
                    </div>
                </div>

            </section>
        </div>
    );
};

export default AdminDashboardEduFlow;
