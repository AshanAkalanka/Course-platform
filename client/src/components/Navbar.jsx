import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import MaterialIcon from './MaterialIcon';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [bellOpen, setBellOpen] = useState(false);
    const bellRef = useRef(null);

    const getNavClassName = ({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`;

    // Fetch notifications every 30 seconds while logged in
    useEffect(() => {
        if (!user) return undefined;

        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data);
            } catch {
                setNotifications([]);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setBellOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch {
            return;
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch {
            return;
        }
    };

    const formatNotificationDate = (dateStr) => new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric'
    }).format(new Date(dateStr));

    return (
        <header className="site-header">
            <nav className="navbar">
                <div className="navbar-inner fade-up">
                    <NavLink to="/" className="nav-brand">
                        <img src="/eduflow-favicon.png" alt="" className="nav-logo-img" />
                        <span className="nav-brand-copy"><strong>EduFlow</strong><small>Online learning</small></span>
                    </NavLink>

                    <button
                        className="nav-hamburger"
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(o => !o)}
                    >
                        <MaterialIcon name={menuOpen ? 'close' : 'menu'} />
                    </button>

                    <div className={`nav-links${menuOpen ? ' nav-links-open' : ''}`}>
                        <div className="nav-primary-links">
                            {user?.role !== 'admin' && (
                                <>
                                    <NavLink to="/" className={getNavClassName} onClick={() => setMenuOpen(false)}>Home</NavLink>
                                    <NavLink to="/courses" className={getNavClassName} onClick={() => setMenuOpen(false)}>Courses</NavLink>
                                    <NavLink to="/about" className={getNavClassName} onClick={() => setMenuOpen(false)}>About</NavLink>
                                    <NavLink to="/contact" className={getNavClassName} onClick={() => setMenuOpen(false)}>Contact</NavLink>
                                </>
                            )}

                            {user && user.role !== 'admin' && (
                                <NavLink to="/my-learning" className={getNavClassName} onClick={() => setMenuOpen(false)}>My Learning</NavLink>
                            )}

                            {user?.role === 'admin' && (
                                <NavLink to="/admin" className={getNavClassName} onClick={() => setMenuOpen(false)}>
                                    <MaterialIcon name="dashboard" /> Admin workspace
                                </NavLink>
                            )}
                        </div>

                        {!user ? (
                            <div className="nav-auth-actions">
                                <NavLink to="/login" className="nav-login" onClick={() => setMenuOpen(false)}><MaterialIcon name="login" /> Log in</NavLink>
                                <NavLink to="/register" className="nav-join" onClick={() => setMenuOpen(false)}><MaterialIcon name="person_add" /> Join now</NavLink>
                            </div>
                        ) : (
                            <div className="nav-user-actions">
                                {/* Bell icon */}
                                <div className="notif-bell-wrap" ref={bellRef}>
                                    <button
                                        className="notif-bell-btn"
                                        onClick={() => setBellOpen(o => !o)}
                                        aria-label="Notifications"
                                    >
                                        <MaterialIcon name="notifications" filled={unreadCount > 0} />
                                        {unreadCount > 0 && (
                                            <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                        )}
                                    </button>

                                    {bellOpen && (
                                        <div className="notif-dropdown">
                                            <div className="notif-dropdown-header">
                                                <span>Notifications</span>
                                                {unreadCount > 0 && (
                                                    <button className="notif-mark-all" onClick={handleMarkAllRead}>
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>

                                            <div className="notif-list">
                                                {notifications.length === 0 ? (
                                                    <div className="notif-empty">No notifications yet.</div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div
                                                            key={n.id}
                                                            className={`notif-item${!n.is_read ? ' notif-item-unread' : ''}`}
                                                            onClick={() => !n.is_read && handleMarkRead(n.id)}
                                                        >
                                                            <div className="notif-item-title" style={{ color: n.is_urgent ? '#e53e3e' : '' }}>
                                                                {n.is_urgent && <MaterialIcon name="warning" filled />}
                                                                {n.title}
                                                            </div>
                                                            <div className="notif-item-msg" style={{ color: n.is_urgent ? '#c53030' : '' }}>
                                                                {n.message}
                                                            </div>
                                                            <div className="notif-item-time">{formatNotificationDate(n.created_at)}</div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <NavLink
                                    to="/profile"
                                    className={({ isActive }) => `${getNavClassName({ isActive })} nav-profile-link`}
                                    onClick={() => setMenuOpen(false)}
                                    aria-label="Profile"
                                    title="Profile"
                                >
                                    <span className="nav-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                    <span className="nav-user-copy"><strong>{user?.name?.split(' ')[0] || 'Learner'}</strong><small>View profile</small></span>
                                </NavLink>
                                <button className="nav-logout" onClick={() => { logout(); setMenuOpen(false); }} title="Log out"><MaterialIcon name="logout" /> <span>Logout</span></button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
