import { useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';
import { useAuth } from '../context/useAuth';

const Contact = () => {
    const { user } = useAuth();
    const [form, setForm] = useState(() => ({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
    }));
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/contact', form);
            setSubmitted(true);
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSubmitted(false);
        setForm({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
    };

    const topics = ['Course access', 'Account support', 'Technical issue', 'General feedback'];

    return (
        <main className="page contact-page">
            <div className="page-header fade-up">
                <p className="eyebrow">Get in touch</p>
                <h1>How can we help?</h1>
                <p className="page-subtitle">
                    Send a question, report an issue, or share feedback with the EduFlow team.
                </p>
            </div>

            <div className="contact-layout">
                <aside className="contact-guide fade-up">
                    <div className="contact-guide-heading">
                        <span><MaterialIcon name="forum" /></span>
                        <div>
                            <p className="eyebrow">Message support</p>
                            <h2>Start with a few details</h2>
                        </div>
                    </div>
                    <p className="contact-guide-copy">
                        Use this form for course access, account questions, technical issues, or general feedback.
                    </p>
                    <div className="contact-guide-list">
                        <div>
                            <MaterialIcon name="school" />
                            <span><strong>Course questions</strong><small>Ask about available courses or learning access.</small></span>
                        </div>
                        <div>
                            <MaterialIcon name="manage_accounts" />
                            <span><strong>Account support</strong><small>Describe sign-in, profile, or enrollment issues.</small></span>
                        </div>
                        <div>
                            <MaterialIcon name="lightbulb" />
                            <span><strong>Feedback</strong><small>Share an idea that could improve EduFlow.</small></span>
                        </div>
                    </div>
                    <p className="contact-privacy-note"><MaterialIcon name="lock" /> Your message is sent to the site administration.</p>
                </aside>

                <div className="contact-form-panel glass-card fade-up delay-1">
                    <Alert type="error" message={error} />
                    {submitted ? (
                        <div className="contact-success">
                            <div className="contact-success-icon"><MaterialIcon name="check_circle" filled /></div>
                            <h2>Message sent</h2>
                            <p>Thank you for contacting EduFlow. Your message has been submitted successfully.</p>
                            <button className="btn-primary" type="button" onClick={resetForm}>
                                <MaterialIcon name="refresh" /> Send another message
                            </button>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="contact-form-heading">
                                <div>
                                    <p className="eyebrow">Contact form</p>
                                    <h2>Send a message</h2>
                                </div>
                                <span><MaterialIcon name="edit_note" /></span>
                            </div>
                            <div className="contact-topic-picker">
                                <span>Choose a topic</span>
                                <div>
                                    {topics.map((topic) => (
                                        <button key={topic} type="button" className={form.subject === topic ? 'active' : ''} onClick={() => setForm((current) => ({ ...current, subject: topic }))}>{topic}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="contact-form-row">
                                <div className="contact-field">
                                    <label htmlFor="name">Full name</label>
                                    <input id="name" name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                                </div>
                                <div className="contact-field">
                                    <label htmlFor="email">Email address</label>
                                    <input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="contact-field">
                                <label htmlFor="subject">Subject</label>
                                <input id="subject" name="subject" type="text" placeholder="How can we help?" value={form.subject} onChange={handleChange} required />
                            </div>
                            <div className="contact-field">
                                <label htmlFor="message">Message <span>{form.message.length}/2000</span></label>
                                <textarea id="message" name="message" rows={6} maxLength={2000} placeholder="Write your message here..." value={form.message} onChange={handleChange} required />
                            </div>
                            <button type="submit" className="btn-primary contact-submit" disabled={loading}>
                                <MaterialIcon name="send" /> {loading ? 'Sending...' : 'Send message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Contact;
