import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import MaterialIcon from './MaterialIcon';

const navigationGroups = [
    {
        label: 'Workspace',
        items: [
            { to: '/admin', end: true, icon: 'dashboard', label: 'Overview', description: 'Platform summary' }
        ]
    },
    {
        label: 'Learning content',
        items: [
            { to: '/admin/courses', icon: 'auto_stories', label: 'Courses', description: 'Catalog and categories' },
            { to: '/admin/lessons', icon: 'list_alt', label: 'Lessons', description: 'Course lesson order' },
            { to: '/admin/materials', icon: 'folder_open', label: 'Materials', description: 'Files and notices' }
        ]
    },
    {
        label: 'People and access',
        items: [
            { to: '/admin/enrollments', icon: 'school', label: 'Enrollments', description: 'Student requests' },
            { to: '/admin/users', icon: 'group', label: 'Users', description: 'Roles and accounts' }
        ]
    },
    {
        label: 'Communication',
        items: [
            { to: '/admin/messages', icon: 'mail', label: 'Messages', description: 'Contact inbox' },
            { to: '/admin/notifications', icon: 'notifications', label: 'Notifications', description: 'Broadcast updates' }
        ]
    }
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

                <nav className="admin-sidebar-nav" aria-label="Admin navigation">
                    {navigationGroups.map((group) => (
                        <div className="admin-nav-group" key={group.label}>
                            <p className="admin-nav-label">{group.label}</p>
                            {group.items.map((item) => (
                                <NavLink key={item.to} to={item.to} end={item.end} className={getNavClassName}>
                                    <span aria-hidden="true"><MaterialIcon name={item.icon} /></span>
                                    <span className="admin-nav-copy">
                                        <b>{item.label}</b>
                                        <small>{item.description}</small>
                                    </span>
                                    <i aria-hidden="true"><MaterialIcon name="chevron_right" /></i>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

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
