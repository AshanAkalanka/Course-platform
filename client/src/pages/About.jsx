import { Link } from 'react-router-dom';
import MaterialIcon from '../components/MaterialIcon';

const capabilities = [
    { icon: 'search', title: 'Course discovery', text: 'Learners can search the live catalog and filter courses by category and level.' },
    { icon: 'school', title: 'Enrollment workflow', text: 'Students can request enrollment while administrators review and manage each request.' },
    { icon: 'play_circle', title: 'Structured lessons', text: 'Approved learners can open course lessons, watch supported video content, and move through each lesson in order.' },
    { icon: 'monitoring', title: 'Progress tracking', text: 'Completed lessons and course percentages are recorded so learners can continue from where they stopped.' },
    { icon: 'folder_open', title: 'Course materials', text: 'Administrators can organize supporting PDFs, videos, images, notices, and other course resources.' },
    { icon: 'notifications', title: 'Communication', text: 'Notifications and contact messages give administrators a direct way to keep learners informed and respond to questions.' }
];

const About = () => (
    <main className="page about-page">
        <header className="page-header fade-up">
            <p className="eyebrow">About the project</p>
            <h1>One connected space for courses, lessons, and progress.</h1>
            <p className="page-subtitle">EduFlow is a full-stack online course management and learning project built for both students and administrators.</p>
        </header>

        <section className="about-intro-grid fade-up">
            <article className="about-project-story">
                <p className="eyebrow">What is EduFlow?</p>
                <h2>A practical learning platform with a complete course workflow.</h2>
                <p>
                    EduFlow brings the main parts of online learning into one responsive website. Students can create an account, explore available courses, request enrollment, follow lessons, and track their real completion progress.
                </p>
                <p>
                    The same project includes an administration workspace for managing courses, categories, lessons, materials, users, enrollment requests, messages, and platform notifications. The interface is designed to keep these tasks clear without separating learning and management into disconnected systems.
                </p>
                <div className="about-actions">
                    <Link to="/courses" className="btn-primary">Explore courses <MaterialIcon name="arrow_forward" /></Link>
                    <Link to="/contact" className="btn-ghost">Contact the team</Link>
                </div>
            </article>

            <aside className="about-project-card">
                <div className="about-project-brand">
                    <img src="/logo.png" alt="EduFlow logo" />
                    <div><strong>EduFlow</strong><span>Online course platform</span></div>
                </div>
                <div className="about-project-points">
                    <div><MaterialIcon name="person" /><span><strong>Learner experience</strong><small>Catalog, enrollment, lessons, progress, profile, and notifications.</small></span></div>
                    <div><MaterialIcon name="admin_panel_settings" /><span><strong>Admin workspace</strong><small>Course content, users, approvals, materials, and communication.</small></span></div>
                    <div><MaterialIcon name="devices" /><span><strong>Responsive interface</strong><small>A consistent experience across desktop, tablet, and mobile screens.</small></span></div>
                </div>
            </aside>
        </section>

        <section className="about-capabilities fade-up">
            <div className="about-section-heading">
                <div><p className="eyebrow">Project capabilities</p><h2>What the website supports</h2></div>
                <p>Every feature below is connected to the existing application workflow rather than placeholder information.</p>
            </div>
            <div className="about-capability-grid">
                {capabilities.map((item) => (
                    <article key={item.title}>
                        <span><MaterialIcon name={item.icon} /></span>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                    </article>
                ))}
            </div>
        </section>

        <section className="about-role-grid fade-up">
            <article className="about-role-card learner">
                <span><MaterialIcon name="school" /></span>
                <p className="eyebrow">For learners</p>
                <h2>Discover, enroll, and continue learning.</h2>
                <ul>
                    <li><MaterialIcon name="check_circle" /> Search and filter available courses</li>
                    <li><MaterialIcon name="check_circle" /> Follow enrollment approval status</li>
                    <li><MaterialIcon name="check_circle" /> Watch lessons and record completion</li>
                    <li><MaterialIcon name="check_circle" /> Review progress from My Learning</li>
                </ul>
            </article>
            <article className="about-role-card admin">
                <span><MaterialIcon name="dashboard" /></span>
                <p className="eyebrow">For administrators</p>
                <h2>Manage the platform from one workspace.</h2>
                <ul>
                    <li><MaterialIcon name="check_circle" /> Create courses, categories, and lessons</li>
                    <li><MaterialIcon name="check_circle" /> Review users and enrollment requests</li>
                    <li><MaterialIcon name="check_circle" /> Upload and organize course materials</li>
                    <li><MaterialIcon name="check_circle" /> Manage messages and notifications</li>
                </ul>
            </article>
        </section>

        <section className="about-technology fade-up">
            <div><p className="eyebrow">Project foundation</p><h2>Built as a full-stack web application</h2><p>The interface uses React and Vite, the application API runs with Express, and persistent course and account data is managed with MySQL.</p></div>
            <div className="about-tech-list">
                <span><MaterialIcon name="web" /><b>React + Vite</b><small>Client interface</small></span>
                <span><MaterialIcon name="api" /><b>Express</b><small>Application API</small></span>
                <span><MaterialIcon name="database" /><b>MySQL</b><small>Persistent data</small></span>
            </div>
        </section>
    </main>
);

export default About;
