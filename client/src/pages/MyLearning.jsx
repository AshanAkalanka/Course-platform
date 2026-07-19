import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';
import { getCourseImage } from '../utils/media';

const MyLearning = () => {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [sort, setSort] = useState('catalog');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyCoursesProgress = async () => {
            try {
                const response = await api.get('/progress/my-courses');
                setCourses(response.data);
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };
        void fetchMyCoursesProgress();
    }, []);

    const summary = useMemo(() => {
        const completed = courses.filter((course) => course.percentage >= 100).length;
        const inProgress = courses.filter((course) => course.percentage > 0 && course.percentage < 100).length;
        const overall = courses.length
            ? Math.round(courses.reduce((total, course) => total + Number(course.percentage || 0), 0) / courses.length)
            : 0;
        return { completed, inProgress, overall };
    }, [courses]);

    const visibleCourses = useMemo(() => {
        const query = search.trim().toLowerCase();
        const filtered = courses.filter((course) => {
            const percentage = Number(course.percentage || 0);
            const statusMatches = status === 'all'
                || (status === 'completed' && percentage >= 100)
                || (status === 'in-progress' && percentage > 0 && percentage < 100)
                || (status === 'not-started' && percentage === 0);
            return statusMatches && (!query || course.title.toLowerCase().includes(query));
        });

        return [...filtered].sort((first, second) => {
            if (sort === 'title') return first.title.localeCompare(second.title);
            if (sort === 'progress-high') return Number(second.percentage) - Number(first.percentage);
            if (sort === 'progress-low') return Number(first.percentage) - Number(second.percentage);
            return 0;
        });
    }, [courses, search, sort, status]);

    const resetFilters = () => {
        setSearch('');
        setStatus('all');
        setSort('catalog');
    };

    return (
        <main className="page learning-page">
            <div className="page-header fade-up">
                <p className="eyebrow">Your learning space</p>
                <h1>Continue learning. Keep moving forward.</h1>
                <p className="page-subtitle">See your real course progress, find an enrollment quickly, and continue from your next lesson.</p>
            </div>

            <Alert type="error" message={errorMessage} />

            <section className="learning-summary-grid fade-up" aria-label="Learning summary">
                <article><span className="blue"><MaterialIcon name="auto_stories" /></span><div><strong>{courses.length}</strong><p>Enrolled courses</p></div></article>
                <article><span className="purple"><MaterialIcon name="play_circle" /></span><div><strong>{summary.inProgress}</strong><p>In progress</p></div></article>
                <article><span className="green"><MaterialIcon name="verified" /></span><div><strong>{summary.completed}</strong><p>Completed</p></div></article>
                <article><span className="amber"><MaterialIcon name="monitoring" /></span><div><strong>{summary.overall}%</strong><p>Overall progress</p></div></article>
            </section>

            {courses.length > 0 && (
                <section className="learning-controls fade-up">
                    <div className="learning-search">
                        <MaterialIcon name="search" />
                        <label className="sr-only" htmlFor="learning-search">Search enrolled courses</label>
                        <input id="learning-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your courses" />
                    </div>
                    <label>
                        <span>Status</span>
                        <select value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option value="all">All courses</option>
                            <option value="in-progress">In progress</option>
                            <option value="completed">Completed</option>
                            <option value="not-started">Not started</option>
                        </select>
                    </label>
                    <label>
                        <span>Sort</span>
                        <select value={sort} onChange={(event) => setSort(event.target.value)}>
                            <option value="catalog">Enrollment order</option>
                            <option value="title">Course title</option>
                            <option value="progress-high">Most progress</option>
                            <option value="progress-low">Least progress</option>
                        </select>
                    </label>
                </section>
            )}

            <div className="learning-results-heading">
                <div><p className="eyebrow">My courses</p><h2>{loading ? 'Loading progress...' : `${visibleCourses.length} shown`}</h2></div>
                <Link to="/courses" className="btn-ghost"><MaterialIcon name="add" /> Browse more courses</Link>
            </div>

            <div className="course-grid learning-course-grid">
                {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="loading-card" />) : visibleCourses.length ? visibleCourses.map((course) => {
                    const imageUrl = getCourseImage(course);
                    const percentage = Number(course.percentage || 0);
                    const progressLabel = percentage >= 100 ? 'Completed' : percentage > 0 ? 'In progress' : 'Not started';

                    return (
                        <article key={course.id} className="course-card learning-course-card fade-up">
                            <div className="course-card-media">
                                {imageUrl ? <img src={imageUrl} alt={course.title} /> : <div className="course-card-placeholder"><MaterialIcon name="auto_stories" /></div>}
                                <span className={`learning-status-badge ${percentage >= 100 ? 'complete' : percentage > 0 ? 'progress' : ''}`}>{progressLabel}</span>
                            </div>
                            <div className="course-card-body">
                                <div className="learning-course-progress-copy"><span>{course.completedLessons} of {course.totalLessons} lessons</span><strong>{percentage}%</strong></div>
                                <h3>{course.title}</h3>
                                <div className="learning-progress-bar" aria-label={`${percentage}% complete`}><span style={{ width: `${percentage}%` }} /></div>
                                <Link to={`/watch/${course.id}`} className="btn-primary">
                                    <MaterialIcon name={percentage >= 100 ? 'replay' : 'play_arrow'} /> {percentage >= 100 ? 'Review course' : percentage > 0 ? 'Continue learning' : 'Start learning'}
                                </Link>
                            </div>
                        </article>
                    );
                }) : courses.length ? (
                    <div className="empty-state learning-empty-filter">
                        <MaterialIcon name="filter_alt_off" /><h3>No courses match these filters</h3><button type="button" className="btn-primary" onClick={resetFilters}>Reset filters</button>
                    </div>
                ) : (
                    <div className="empty-state learning-empty-filter">
                        <MaterialIcon name="school" /><h3>Your learning space is ready</h3><p>Enroll in a course to see lesson progress here.</p><Link to="/courses" className="btn-primary">Browse courses</Link>
                    </div>
                )}
            </div>
        </main>
    );
};

export default MyLearning;
