import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import { useAuth } from '../context/useAuth';
import { getCourseImage } from '../utils/media';
import MaterialIcon from '../components/MaterialIcon';

const CourseDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [enrollmentStatus, setEnrollmentStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const courseRequest = api.get(`/courses/${id}`);
                const statusRequest = user ? api.get('/enrollments/my-statuses') : Promise.resolve({ data: [] });
                const [courseResponse, statusResponse] = await Promise.all([courseRequest, statusRequest]);

                setCourse(courseResponse.data);
                const found = statusResponse.data.find(e => Number(e.course_id) === Number(id));
                setEnrollmentStatus(found ? found.status : null);
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            }
        };

        void loadPageData();
    }, [id, user]);

    const handleEnroll = async () => {
        try {
            setIsSubmitting(true);
            const res = await api.post('/enrollments', { course_id: id });
            setMessage(res.data.message || 'Enrollment request submitted. Awaiting admin approval.');
            setErrorMessage('');
            setEnrollmentStatus('pending');
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!course && !errorMessage) return <div className="page"><div className="empty-state">Loading course...</div></div>;
    const courseImage = course ? getCourseImage(course) : '';

    return (
        <div className="page">
            <Alert type="success" message={message} />
            <Alert type="error" message={errorMessage} />

            {course ? (
                <div className="details-layout">
                    <div className="details-hero fade-up">
                        {courseImage ? <img src={courseImage} alt={course.title} /> : <div className="details-hero-placeholder"><MaterialIcon name="auto_stories" /></div>}
                    </div>

                    <div className="details-card fade-up delay-1">
                        <div className="details-hero-copy">
                            <div className="page-header">
                                <p className="eyebrow">Course details</p>
                                <h2 className="details-title">{course.title}</h2>
                                <p className="page-subtitle">{course.description}</p>
                            </div>

                            <div className="details-summary-grid">
                                {course.category && <div className="details-summary-card">
                                    <strong>{course.category}</strong>
                                    <span>Category</span>
                                </div>}
                                {course.level && <div className="details-summary-card">
                                    <strong>{course.level}</strong>
                                    <span>Level</span>
                                </div>}
                                <div className="details-summary-card">
                                    <strong>{course.lessons?.length || 0}</strong>
                                    <span>Lessons</span>
                                </div>
                            </div>
                        </div>

                        <div className="details-meta">
                            {course.category && <span className="meta-pill">{course.category}</span>}
                            {course.level && <span className="meta-pill alt">{course.level}</span>}
                            <span>{course.lessons?.length || 0} lessons included</span>
                        </div>

                        {user ? (
                            <div className="course-card-actions">
                                {enrollmentStatus === 'approved' && (
                                    <>
                                        <span className="meta-pill"><MaterialIcon name="check_circle" filled /> Enrolled</span>
                                        <button className="btn-primary" onClick={() => navigate('/my-learning')}>
                                            Go to My Learning
                                        </button>
                                    </>
                                )}
                                {enrollmentStatus === 'pending' && (
                                    <span className="meta-pill" style={{ background: '#fef9c3', color: '#854d0e' }}><MaterialIcon name="pending" /> Pending admin approval</span>
                                )}
                                {enrollmentStatus === 'rejected' && (
                                    <>
                                        <span className="meta-pill" style={{ background: '#fee2e2', color: '#991b1b' }}><MaterialIcon name="cancel" filled /> Rejected</span>
                                        <button className="btn-primary" onClick={handleEnroll} disabled={isSubmitting}>
                                            <MaterialIcon name="refresh" /> {isSubmitting ? 'Requesting...' : 'Request Again'}
                                        </button>
                                    </>
                                )}
                                {enrollmentStatus === null && (
                                    <button className="btn-primary" onClick={handleEnroll} disabled={isSubmitting}>
                                        <MaterialIcon name="school" /> {isSubmitting ? 'Enrolling...' : 'Enroll Now'}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="course-card-actions">
                                <p className="page-subtitle">Create an account or sign in to enroll and track progress.</p>
                                <Link to="/login" className="btn-primary"><MaterialIcon name="login" /> Sign in to enroll</Link>
                            </div>
                        )}

                        <div>
                            <h3>Course lessons</h3>
                            <div className="lesson-list">
                                {course.lessons?.length ? (
                                    course.lessons.map((lesson) => (
                                        <div key={lesson.id} className="lesson-row">
                                            <div className="lesson-row-head">
                                                <strong>{lesson.lesson_order}. {lesson.title}</strong>
                                                <span className="meta-pill alt">Lesson {lesson.lesson_order}</span>
                                            </div>
                                            {lesson.content && <p>{lesson.content}</p>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">This course does not have lessons yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="empty-state">Unable to load this course.</div>
            )}
        </div>
    );
};

export default CourseDetails;
