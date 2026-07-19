import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import MaterialIcon from './MaterialIcon';

const navigation = [
    { to: '/admin', end: true, icon: 'dashboard', label: 'Overview' },
    { to: '/admin/courses', icon: 'auto_stories', label: 'Courses' },
    { to: '/admin/lessons', icon: 'list_alt', label: 'Lessons' },
    { to: '/admin/enrollments', icon: 'school', label: 'Enrollments' },
    { to: '/admin/materials', icon: 'folder_open', label: 'Materials' },
    { to: '/admin/users', icon: 'group', label: 'Users' },
    { to: '/admin/messages', icon: 'mail', label: 'Messages' },
    { to: '/admin/notifications', icon: 'notifications', label: 'Notifications' }
];

const AdminShell = () => {
    const { user } = useAuth();
    const getNavClassName = ({ isActive }) => `admin-sidebar-link${isActive ? ' active' : ''}`;

    return (
        <div className="admin-dashboard-container">
            <aside className="admin-sidebar fade-up">
                <div className="admin-sidebar-brand">
                    <img src="/logo.png" alt="" />
                    <div><strong>EduFlow</strong><small>Admin workspace</small></div>
                </div>

                <p className="admin-nav-label">Workspace</p>
                <nav className="admin-sidebar-nav" aria-label="Admin navigation">
                    {navigation.map((item) => (
                        <NavLink key={item.to} to={item.to} end={item.end} className={getNavClassName}>
                            <span aria-hidden="true"><MaterialIcon name={item.icon} /></span>
                            <b>{item.label}</b>
                            <i aria-hidden="true"><MaterialIcon name="chevron_right" /></i>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-help-card">
                    <span><MaterialIcon name="help" /></span>
                    <strong>Need assistance?</strong>
                    <p>Review student requests and platform activity from this workspace.</p>
                </div>

                <div className="admin-user-card">
                    <span>{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                    <div>
                        <strong>{user?.name || 'Administrator'}</strong>
                        {user?.email && <small>{user.email}</small>}
                    </div>
                </div>
            </aside>

            <main className="admin-main-content">
                <div className="admin-mobile-heading">
                    <span>Admin workspace</span>
                    <strong>{user?.name || 'Administrator'}</strong>
                </div>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminShell;
