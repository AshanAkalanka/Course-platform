import { Link } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';
import { useAuth } from '../context/useAuth';

const Footer = () => {
    const { user } = useAuth();

    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-callout">
                    <div>
                        <span className="footer-callout-icon"><MaterialIcon name="support_agent" /></span>
                        <div>
                            <p>Need help with EduFlow?</p>
                            <h2>Send us a message and tell us what you need.</h2>
                        </div>
                    </div>
                    <Link to="/contact" className="footer-contact-link">
                        Contact us <MaterialIcon name="arrow_forward" />
                    </Link>
                </div>

                <div className="footer-top">
                    <div className="footer-brand-section">
                        <div className="footer-brand-header">
                            <img src="/logo.png" alt="EduFlow logo" className="footer-logo-img" />
                            <h3 className="footer-logo">EduFlow</h3>
                        </div>
                        <p className="footer-tagline">
                            Browse available courses, follow structured lessons, and keep your learning progress in one place.
                        </p>
                    </div>

                    <div className="footer-nav-grid">
                        <div className="footer-col">
                            <h4>Explore</h4>
                            <Link to="/">Home</Link>
                            <Link to="/about">About</Link>
                            <Link to="/courses">Courses</Link>
                            <Link to="/contact">Contact</Link>
                        </div>
                        <div className="footer-col">
                            <h4>{user ? 'Account' : 'Get started'}</h4>
                            {user?.role === 'admin' ? (
                                <Link to="/admin">Admin overview</Link>
                            ) : user ? (
                                <>
                                    <Link to="/my-learning">My learning</Link>
                                    <Link to="/profile">Profile</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">Log in</Link>
                                    <Link to="/register">Create account</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} EduFlow. All rights reserved.</p>
                    <span>Online course management and learning</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
