import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import { getVideoSource } from '../utils/video';
import MaterialIcon from '../components/MaterialIcon';

const WatchLesson = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [progress, setProgress] = useState({
        completedLessonIds: [],
        percentage: 0
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const videoSource = selectedLesson ? getVideoSource(selectedLesson.video_url) : { type: 'invalid', src: null };

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const res = await api.get(`/courses/${id}`);
                setCourse(res.data);
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            }
        };

        const loadProgress = async () => {
            try {
                const res = await api.get(`/progress/course/${id}`);
                setProgress(res.data);
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };

        void loadCourse();
        void loadProgress();
    }, [id]);

    useEffect(() => {
        if (!course?.lessons?.length) {
            return;
        }

        const currentStillExists = course.lessons.some((lesson) => lesson.id === selectedLesson?.id);
        if (currentStillExists) {
            return;
        }

        const firstIncompleteLesson = course.lessons.find(
            (lesson) => !progress.completedLessonIds.includes(lesson.id)
        );

        setSelectedLesson(firstIncompleteLesson || course.lessons[0]);
    }, [course, progress.completedLessonIds, selectedLesson]);

    const selectedLessonIndex = course?.lessons?.findIndex((lesson) => lesson.id === selectedLesson?.id) ?? -1;
    const previousLesson = selectedLessonIndex > 0 ? course?.lessons[selectedLessonIndex - 1] : null;
    const nextLesson = selectedLessonIndex >= 0 && selectedLessonIndex < (course?.lessons?.length ?? 0) - 1
        ? course?.lessons[selectedLessonIndex + 1]
        : null;
    const completedCount = progress.completedLessonIds.length;
    const totalLessons = course?.lessons?.length || 0;
    const selectedLessonCompleted = selectedLesson ? progress.completedLessonIds.includes(selectedLesson.id) : false;

    const markComplete = async (lessonId) => {
        if (progress.completedLessonIds.includes(lessonId)) {
            setMessage('This lesson is already completed.');
            return;
        }

        try {
            await api.post('/progress/complete', {
                course_id: id,
                lesson_id: lessonId
            });
            setMessage(nextLesson ? 'Lesson completed. Your next lesson is ready.' : 'Lesson completed. You reached the end of this course.');
            const res = await api.get(`/progress/course/${id}`);
            setProgress(res.data);
            if (nextLesson) setSelectedLesson(nextLesson);
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        }
    };

    if (loading && !course) return <div className="page"><div className="loading-panel"></div></div>;
    if (!course) return <div className="page"><div className="empty-state">Unable to load lessons.</div></div>;

    return (
        <main className="page lesson-watch-page">
            <div className="page-header">
                <p className="eyebrow">Watch lessons</p>
                <h2>{course.title}</h2>
                <p className="page-subtitle">Choose a lesson, watch the content, and mark progress as you complete each step.</p>
                <Link to="/my-learning" className="page-header-link"><MaterialIcon name="arrow_back" /> My learning</Link>
            </div>

            <Alert type="success" message={message} />
            <Alert type="error" message={errorMessage} />

            <section className="lesson-progress-panel fade-up" aria-label="Course progress">
                <div>
                    <span className="lesson-progress-icon"><MaterialIcon name="monitoring" /></span>
                    <div><p>Course progress</p><strong>{completedCount} of {totalLessons} lessons completed</strong></div>
                </div>
                <div className="lesson-progress-meter"><span style={{ width: `${progress.percentage}%` }} /></div>
                <b>{progress.percentage}%</b>
            </section>

            <div className="watch-page-layout">
                <div className="lesson-sidebar fade-up">
                    <div className="lesson-sidebar-heading"><div><p className="eyebrow">Course content</p><h3>Lessons</h3></div><span>{totalLessons}</span></div>
                    {course.lessons?.map((lesson) => {
                        const completed = progress.completedLessonIds.includes(lesson.id);

                        return (
                            <button
                                type="button"
                                key={lesson.id}
                                className={`lesson-item ${selectedLesson?.id === lesson.id ? 'active-lesson' : ''}`}
                                onClick={() => {
                                    setSelectedLesson(lesson);
                                    setMessage('');
                                }}
                            >
                                <span className={`lesson-number ${completed ? 'complete' : ''}`}>{completed ? <MaterialIcon name="check" /> : lesson.lesson_order}</span>
                                <span className="lesson-item-copy"><strong>{lesson.title}</strong><small>{completed ? 'Completed' : selectedLesson?.id === lesson.id ? 'Now playing' : 'Not completed'}</small></span>
                                <MaterialIcon name="chevron_right" />
                            </button>
                        );
                    })}
                </div>

                <div className="lesson-player fade-up">
                    {selectedLesson ? (
                        <>
                            {videoSource.type === 'embed' && videoSource.src ? (
                                <iframe
                                    width="100%"
                                    height="420"
                                    src={videoSource.src}
                                    title={selectedLesson.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            ) : null}

                            {videoSource.type === 'video' && videoSource.src ? (
                                <video className="lesson-video" controls preload="metadata">
                                    <source src={videoSource.src} />
                                    Your browser does not support the video tag.
                                </video>
                            ) : null}

                            {videoSource.type === 'link' && videoSource.src ? (
                                <div className="empty-state">
                                    <p style={{ marginBottom: '12px' }}>
                                        This video host does not support direct inline playback here.
                                    </p>
                                    <a className="btn-primary" href={videoSource.src} target="_blank" rel="noreferrer">
                                        <MaterialIcon name="open_in_new" /> Open Video
                                    </a>
                                </div>
                            ) : (
                                videoSource.type === 'invalid' && (
                                    <div className="empty-state">
                                        This lesson does not have a valid video URL yet.
                                    </div>
                                )
                            )}

                            <div className="lesson-player-heading">
                                <div><p className="eyebrow">Lesson {selectedLesson.lesson_order}</p><h3>{selectedLesson.title}</h3></div>
                                {selectedLessonCompleted && <span><MaterialIcon name="check_circle" filled /> Completed</span>}
                            </div>
                            {selectedLesson.content && <p>{selectedLesson.content}</p>}
                            <div className="lesson-player-actions">
                                <button
                                    className="btn-ghost"
                                    onClick={() => previousLesson && setSelectedLesson(previousLesson)}
                                    disabled={!previousLesson}
                                >
                                    <MaterialIcon name="arrow_back" /> Previous Lesson
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={() => markComplete(selectedLesson.id)}
                                    disabled={selectedLessonCompleted}
                                >
                                    <MaterialIcon name="check_circle" /> {selectedLessonCompleted ? 'Lesson completed' : 'Mark as complete'}
                                </button>
                                <button
                                    className="btn-ghost"
                                    onClick={() => nextLesson && setSelectedLesson(nextLesson)}
                                    disabled={!nextLesson}
                                >
                                    Next Lesson <MaterialIcon name="arrow_forward" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <p>No lesson selected</p>
                    )}
                </div>
            </div>
        </main>
    );
};

export default WatchLesson;
