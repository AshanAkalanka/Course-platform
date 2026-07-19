import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import heroImage from '../assets/generated/eduflow-hero.png';
import Alert from '../components/Alert';
import CourseCard from '../components/CourseCard';
import MaterialIcon from '../components/MaterialIcon';
import { useAuth } from '../context/useAuth';

const tones = ['blue', 'purple', 'pink', 'green', 'amber', 'cyan'];

const getCategoryIcon = (name = '') => {
    const value = name.toLowerCase();
    if (value.includes('develop') || value.includes('program')) return 'code';
    if (value.includes('design')) return 'design_services';
    if (value.includes('market')) return 'campaign';
    if (value.includes('business')) return 'business_center';
    if (value.includes('data') || value.includes('science')) return 'database';
    if (value.includes('growth') || value.includes('personal')) return 'psychology';
    return 'category';
};

const HomeLive = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [learning, setLearning] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadCatalog = async () => {
            try {
                const [coursesResponse, categoriesResponse] = await Promise.all([
                    api.get('/courses'),
                    api.get('/courses/categories')
                ]);
                setCourses(coursesResponse.data);
                setCategories(categoriesResponse.data);
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };

        void loadCatalog();
    }, []);

    useEffect(() => {
        if (!user || user.role === 'admin') {
            setLearning([]);
            return;
        }

        api.get('/progress/my-courses')
            .then((response) => setLearning(response.data))
            .catch(() => setLearning([]));
    }, [user]);

    const levels = useMemo(
        () => [...new Set(courses.map((course) => course.level).filter(Boolean))],
        [courses]
    );
    const latestCourses = courses.slice(0, 4);
    const currentCourse = learning[0];

    const handleSearch = (event) => {
        event.preventDefault();
        navigate('/courses', { state: { search: search.trim() } });
    };

    return (
        <main className="home-editorial">
            <section className="home-hero fade-up" aria-labelledby="home-heading">
                <div className="home-hero-copy">
                    <p className="home-kicker">Learn without limits</p>
                    <h1 id="home-heading">Learn Online.<br />Achieve <span>More.</span></h1>
                    <p className="home-lead">Explore the courses available on EduFlow and build skills through structured lessons.</p>
                    <form className="home-search" onSubmit={handleSearch}>
                        <label className="sr-only" htmlFor="home-search">What do you want to learn?</label>
                        <input id="home-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="What do you want to learn today?" />
                        <button type="submit" className="btn-primary"><MaterialIcon name="search" /> Search</button>
                    </form>
                </div>
                <div className="home-hero-media"><img src={heroImage} alt="Student learning online with headphones and a laptop" /></div>
                {!loading && (
                    <div className="hero-stats-card" aria-label="Current catalog statistics">
                        <div><span className="stat-icon blue"><MaterialIcon name="auto_stories" /></span><p>Available Courses<strong>{courses.length}</strong></p></div>
                        <div><span className="stat-icon purple"><MaterialIcon name="category" /></span><p>Categories<strong>{categories.length}</strong></p></div>
                        <div><span className="stat-icon green"><MaterialIcon name="signal_cellular_alt" /></span><p>Course Levels<strong>{levels.length}</strong></p></div>
                    </div>
                )}
            </section>

            <Alert type="error" message={errorMessage} />

            <section className="home-categories fade-up delay-1" aria-labelledby="category-heading">
                <div className="section-heading-row">
                    <div><p className="eyebrow">Explore your path</p><h2 id="category-heading">Browse by Category</h2></div>
                    <Link to="/courses">View all <MaterialIcon name="arrow_forward" /></Link>
                </div>
                {categories.length ? (
                    <div className="category-grid">
                        {categories.map((category, index) => {
                            const courseCount = courses.filter((course) => course.category === category).length;
                            return (
                                <Link to="/courses" state={{ category }} className="category-card" key={category}>
                                    <span className={`category-icon ${tones[index % tones.length]}`}><MaterialIcon name={getCategoryIcon(category)} /></span>
                                    <span><strong>{category}</strong><small>{courseCount} course{courseCount === 1 ? '' : 's'}</small></span>
                                    <MaterialIcon name="chevron_right" />
                                </Link>
                            );
                        })}
                    </div>
                ) : !loading && <div className="empty-state">No course categories are available yet.</div>}
            </section>

            <section className="home-dashboard-grid fade-up delay-2">
                <div className="home-featured">
                    <div className="section-heading-row">
                        <div><p className="eyebrow">From your catalog</p><h2>Latest Courses</h2></div>
                        <Link to="/courses">View all <MaterialIcon name="arrow_forward" /></Link>
                    </div>
                    {latestCourses.length ? (
                        <div className="featured-course-grid home-live-courses">
                            {latestCourses.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}
                        </div>
                    ) : !loading && <div className="empty-state">No courses have been added yet.</div>}
                </div>

                <aside className="home-learning-panel">
                    <div className="learning-panel-card">
                        <div className="section-heading-row compact"><h3>{user ? 'My Learning' : 'Start Learning'}</h3>{user && <Link to="/my-learning">See all</Link>}</div>
                        {currentCourse ? (
                            <>
                                <div className="current-course">
                                    <span className="current-course-icon"><MaterialIcon name="school" /></span>
                                    <div><strong>{currentCourse.title}</strong><div className="course-progress"><i style={{ width: `${currentCourse.percentage}%` }} /></div><small>{currentCourse.completedLessons} of {currentCourse.totalLessons} lessons · {currentCourse.percentage}%</small></div>
                                </div>
                                <Link className="continue-learning" to={`/watch/${currentCourse.id}`}><MaterialIcon name="play_arrow" filled /> Continue Learning</Link>
                            </>
                        ) : user ? (
                            <div className="learning-panel-empty"><MaterialIcon name="school" /><p>No enrolled courses yet.</p><Link to="/courses">Browse courses</Link></div>
                        ) : (
                            <div className="learning-panel-empty"><MaterialIcon name="login" /><p>Sign in to enroll in courses and track your progress.</p><Link to="/login">Sign in</Link></div>
                        )}
                    </div>

                    <div className="learning-panel-card">
                        <div className="section-heading-row compact"><h3>Catalog Levels</h3><Link to="/courses">View courses</Link></div>
                        {levels.length ? levels.map((level) => {
                            const count = courses.filter((course) => course.level === level).length;
                            return <div className="catalog-level-row" key={level}><span><MaterialIcon name="signal_cellular_alt" />{level}</span><strong>{count}</strong></div>;
                        }) : <div className="learning-panel-empty compact"><p>No course levels are available yet.</p></div>}
                    </div>
                </aside>
            </section>
        </main>
    );
};

export default HomeLive;
