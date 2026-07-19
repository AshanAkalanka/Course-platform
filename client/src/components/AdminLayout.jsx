import { NavLink, Outlet } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';

const AdminLayout = () => {
    const getNavClassName = ({ isActive }) => `admin-sidebar-link${isActive ? ' active' : ''}`;

    return (
        <div className="admin-dashboard-container">
            <aside className="admin-sidebar fade-up">
                <div className="admin-sidebar-header">
                    <h3>Admin Panel</h3>
                </div>
                <nav className="admin-sidebar-nav">
                    <NavLink to="/admin" end className={getNavClassName}>
                        <span><MaterialIcon name="dashboard" /></span> Dashboard
                    </NavLink>
                    <NavLink to="/admin/courses" className={getNavClassName}>
                        <span><MaterialIcon name="auto_stories" /></span> Courses
                    </NavLink>
                    <NavLink to="/admin/lessons" className={getNavClassName}>
                        <span><MaterialIcon name="list_alt" /></span> Lessons
                    </NavLink>
                    <NavLink to="/admin/users" className={getNavClassName}>
                        <span><MaterialIcon name="group" /></span> Users
                    </NavLink>
                    <NavLink to="/admin/messages" className={getNavClassName}>
                        <span><MaterialIcon name="mail" /></span> Messages
                    </NavLink>
                    <NavLink to="/admin/enrollments" className={getNavClassName}>
                        <span><MaterialIcon name="school" /></span> Enrollments
                    </NavLink>
                    <NavLink to="/admin/materials" className={getNavClassName}>
                        <span><MaterialIcon name="folder_open" /></span> Materials
                    </NavLink>
                    <NavLink to="/admin/notifications" className={getNavClassName}>
                        <span><MaterialIcon name="notifications" /></span> Notifications
                    </NavLink>
                </nav>
            </aside>
            <main className="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
