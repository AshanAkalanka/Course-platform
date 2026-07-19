import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Alert from '../components/Alert';
import heroImage from '../assets/generated/eduflow-hero.png';
import MaterialIcon from '../components/MaterialIcon';

const Auth = () => {
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(location.pathname === '/login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setIsLogin(location.pathname === '/login');
    }, [location.pathname]);

    useEffect(() => {
        document.body.classList.add('no-scroll');
        return () => document.body.classList.remove('no-scroll');
    }, []);

    const toggleMode = () => {
        setErrorMessage('');
        setForm({ name: '', email: '', password: '' });
        if (isLogin) {
            navigate('/register');
        } else {
            navigate('/login');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin ? { email: form.email, password: form.password } : form;
            const res = await api.post(endpoint, payload);
            login(res.data);
            navigate('/');
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-layout">
                <div className="auth-panel fade-up">
                    <p className="eyebrow">{isLogin ? 'Sign in' : 'Get started'}</p>
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <h2>
                            {isLogin 
                                ? 'Welcome back to your learning workspace.' 
                                : 'Create your EduFlow account.'}
                        </h2>
                        <p className="auth-copy">
                            {isLogin 
                                ? 'Access your enrolled courses, resume lessons, and keep your progress moving.'
                                : 'Join the platform, enroll in courses, and start learning with guided lessons.'}
                        </p>

                        <Alert type="error" message={errorMessage} />

                        {!isLogin && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                        <div className="auth-actions">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                <MaterialIcon name={isLogin ? 'login' : 'person_add'} />
                                {loading 
                                    ? (isLogin ? 'Signing in...' : 'Creating account...') 
                                    : (isLogin ? 'Login' : 'Register')}
                            </button>
                            <button type="button" onClick={toggleMode} className="btn-ghost">
                                <MaterialIcon name={isLogin ? 'person_add' : 'login'} />
                                {isLogin ? 'Create account' : 'Already have an account?'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="auth-panel auth-side fade-up delay-1">
                    <p className="eyebrow">{isLogin ? 'Welcome back' : 'Start today'}</p>
                    <h3>
                        {isLogin 
                            ? 'Continue learning from where you left off.' 
                            : 'Create your account and begin your learning journey.'}
                    </h3>
                    <p>
                        {isLogin 
                            ? 'Sign in to access your courses, watch lessons, and keep your progress moving forward.' 
                            : 'Discover courses, build new skills, and track your progress as you complete each lesson.'}
                    </p>
                    <img 
                        src={heroImage}
                        alt={isLogin ? "Students studying together" : "Online learning collaboration"} 
                    />
                </div>
            </div>
        </div>
    );
};

export default Auth;
