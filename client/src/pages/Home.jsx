import { Link } from 'react-router-dom';
import { homepageImages } from '../utils/media';

const Home = () => {
    return (
        <div className="home-editorial">
            <section className="home-hero fade-up">
                <div className="home-hero-copy">
                    <p className="home-kicker">Accessible online learning</p>
                    <h1>Learn skills that move you forward.</h1>
                    <p className="home-lead">
                        Explore online courses, enroll with ease, and continue learning through
                        structured lessons built for steady progress.
                    </p>
                    <div className="home-actions">
                        <Link to="/courses" className="btn-primary">Explore Courses</Link>
                        <Link to="/register" className="btn-ghost">Create Account</Link>
                    </div>
                </div>

                <div className="home-hero-media">
                    <img src={homepageImages.hero} alt="Students learning online" />
                </div>
            </section>

            <section className="home-about fade-up delay-1">
                <div className="home-about-inner">
                    <h2>About EduFlow</h2>
                    <div className="about-text-content">
                        <p>
                            Welcome to our online course platform, a modern learning website designed to help users easily discover, enroll in, and complete courses in one place. This platform provides a simple and interactive learning experience where students can browse available courses, search and filter courses by category or level, watch lessons, and track their learning progress.
                        </p>
                        <p>
                            The website is built to support both learners and administrators. Learners can create accounts, log in securely, enroll in courses, and continue their studies through a clean and user-friendly interface. Administrators can manage courses, lessons, user accounts, and course content to keep the platform organized and up to date.
                        </p>
                        <p>
                            Our goal is to make online learning more accessible, structured, and engaging through a responsive design, smooth navigation, and useful features that improve the overall learning experience.
                        </p>
                    </div>
                </div>
            </section>

            <section className="home-program-panels fade-up delay-2" aria-label="Learning highlights">
                <div className="program-panel panel-light">
                    <span>01.</span>
                    <h3>Course Catalog</h3>
                </div>
                <div className="program-panel panel-dark">
                    <span>02.</span>
                    <h3>Structured Lessons</h3>
                </div>
                <div className="program-panel panel-red">
                    <span>03.</span>
                    <h3>Progress Tracking</h3>
                </div>
            </section>

            <section className="home-story fade-up delay-2">
                <div className="home-story-side">
                    <img src={homepageImages.highlight} alt="Focused online learning" />
                    <img src={homepageImages.secondary} alt="Students working together" />
                    <img src={homepageImages.tertiary} alt="Library learning space" />
                    <img src={homepageImages.gallery} alt="Campus learning community" />
                </div>

                <div className="home-story-main">
                    <h2>Courses, lessons, and progress in one simple learning space.</h2>
                    <p>
                        Browse the catalog, review course details, and start learning with a clear
                        path from enrollment to lesson completion.
                    </p>
                    
                    <ol className="home-story-steps">
                        <li><strong>Discover your path:</strong> Explore the courses currently available in the catalog.</li>
                        <li><strong>Enroll effortlessly:</strong> Join any course that fits your career aspirations with a single click.</li>
                        <li><strong>Track and conquer:</strong> Monitor your milestones using our interactive dashboards.</li>
                        <li><strong>Master the skill:</strong> Complete sequential, hands-on lessons tailored for immediate real-world application.</li>
                    </ol>

                    <div className="home-story-points">
                        <span>Course catalog</span>
                        <span>Structured lessons</span>
                        <span>Progress tracking</span>
                        <span>Account support</span>
                    </div>
                </div>
            </section>

            <section className="home-values fade-up delay-3">
                <div className="home-values-line"></div>
                <div className="home-values-grid">
                    <div>
                        <h3>Explore</h3>
                        <p>Find courses by subject, level, and learning goals.</p>
                    </div>
                    <div>
                        <h3>Learn</h3>
                        <p>Watch lessons in order and keep your studies organized.</p>
                    </div>
                    <div>
                        <h3>Progress</h3>
                        <p>Return anytime and continue from where you stopped.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
