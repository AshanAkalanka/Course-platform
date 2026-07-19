import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminFormModal from '../components/AdminFormModal';

const initialForm = {
    course_id: '',
    title: '',
    video_url: '',
    content: '',
    lesson_order: 1
};

const AdminLessons = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [lessons, setLessons] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const res = await api.get('/courses');
                setCourses(res.data);
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            }
        };

        void loadCourses();
    }, []);

    useEffect(() => {
        const loadLessons = async () => {
            if (!selectedCourseId) {
                setLessons([]);
                return;
            }

            try {
                const res = await api.get(`/courses/${selectedCourseId}`);
                setLessons(res.data.lessons || []);
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            }
        };

        void loadLessons();
    }, [selectedCourseId]);

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourseId(courseId);
        setForm({ ...form, course_id: courseId });
        setEditingLessonId(null);
        setIsLessonModalOpen(false);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({
            course_id: selectedCourseId || '',
            title: '',
            video_url: '',
            content: '',
            lesson_order: 1
        });
        setEditingLessonId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                ...form,
                lesson_order: Number(form.lesson_order)
            };

            if (editingLessonId) {
                await api.put(`/lessons/${editingLessonId}`, payload);
                setMessage('Lesson updated successfully');
            } else {
                await api.post('/lessons', payload);
                setMessage('Lesson added successfully');
            }

            resetForm();
            const res = await api.get(`/courses/${selectedCourseId}`);
            setLessons(res.data.lessons || []);
            setErrorMessage('');
            setIsLessonModalOpen(false);
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        }
    };

    const handleEdit = (lesson) => {
        setForm({
            course_id: selectedCourseId,
            title: lesson.title,
            video_url: lesson.video_url,
            content: lesson.content || '',
            lesson_order: lesson.lesson_order
        });
        setEditingLessonId(lesson.id);
        setErrorMessage('');
        setIsLessonModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Delete this lesson?');
        if (!confirmDelete) return;

        try {
            await api.delete(`/lessons/${id}`);
            setMessage('Lesson deleted successfully');
            const res = await api.get(`/courses/${selectedCourseId}`);
            setLessons(res.data.lessons || []);
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        }
    };

    const selectedCourse = courses.find((course) => String(course.id) === String(selectedCourseId));

    return (
        <div className="page admin-workspace-page admin-lessons-page">
            <AdminPageHeader
                icon="list_alt"
                eyebrow="Learning content"
                title="Lesson builder"
                description="Select a course, arrange its lesson sequence, and keep playback information organized."
                tone="purple"
            />

            <div className="admin-page-metrics fade-up" aria-label="Lesson workspace summary">
                <article><span className="blue"><MaterialIcon name="auto_stories" /></span><div><strong>{courses.length}</strong><small>Available courses</small></div></article>
                <article><span className="purple"><MaterialIcon name="format_list_numbered" /></span><div><strong>{lessons.length}</strong><small>Lessons in view</small></div></article>
                <article className="admin-metric-wide"><span className="green"><MaterialIcon name="check_circle" /></span><div><strong>{selectedCourse?.title || 'None selected'}</strong><small>Current course</small></div></article>
            </div>

            <Alert type="success" message={message} />
            <Alert type="error" message={errorMessage} />

            <div className="admin-form admin-course-picker fade-up">
                <div className="admin-form-heading"><span><MaterialIcon name="school" /></span><div><h3>Select course</h3><p>Choose which course lesson plan you want to manage.</p></div></div>
                <select value={selectedCourseId} onChange={handleCourseChange} required>
                    <option value="">Choose a course</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.title}
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourseId && (
                <>
                    <div className="admin-page-primary-action fade-up">
                        <div><strong>Build this lesson sequence</strong><span>Add a lesson or edit an existing row without leaving the list.</span></div>
                        <button type="button" className="btn-primary" onClick={() => { resetForm(); setErrorMessage(''); setIsLessonModalOpen(true); }}><MaterialIcon name="add_circle" /> Add lesson</button>
                    </div>

                    <div className="admin-table-wrapper admin-data-panel fade-up">
                        <div className="admin-section-title">
                            <div><span><MaterialIcon name="format_list_numbered" /></span><div><h3>Lesson sequence</h3><p>Lessons appear to students in this order.</p></div></div>
                            <strong>{lessons.length} total</strong>
                        </div>
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Order</th>
                                <th>Title</th>
                                <th>Video URL</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {lessons.map((lesson) => (
                                <tr key={lesson.id}>
                                    <td>{lesson.id}</td>
                                    <td>{lesson.lesson_order}</td>
                                    <td>{lesson.title}</td>
                                    <td className="video-url-cell">{lesson.video_url}</td>
                                    <td className="table-actions">
                                        <button className="btn-small edit-btn" onClick={() => handleEdit(lesson)}>
                                            <MaterialIcon name="edit" /> Edit
                                        </button>
                                        <button className="btn-small delete-btn" onClick={() => handleDelete(lesson.id)}>
                                            <MaterialIcon name="delete" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {lessons.length === 0 && (
                            <div className="empty-state admin-panel-empty">No lessons added for this course yet.</div>
                        )}
                    </div>
                </>
            )}

            <AdminFormModal
                open={isLessonModalOpen}
                onClose={() => { resetForm(); setIsLessonModalOpen(false); setErrorMessage(''); }}
                icon={editingLessonId ? 'edit_note' : 'playlist_add'}
                eyebrow={selectedCourse?.title || 'Course lesson'}
                title={editingLessonId ? 'Edit lesson' : 'Add lesson'}
            >
                <form className="admin-course-modal-form" onSubmit={handleSubmit}>
                    {errorMessage && <div className="admin-modal-field-wide"><Alert type="error" message={errorMessage} /></div>}
                    <label className="admin-modal-field admin-modal-field-wide"><span>Lesson title</span><input type="text" name="title" placeholder="Enter the lesson title" value={form.title} onChange={handleChange} required autoFocus /></label>
                    <label className="admin-modal-field admin-modal-field-wide"><span>Video URL</span><input type="url" name="video_url" placeholder="https://example.com/video" value={form.video_url} onChange={handleChange} required /></label>
                    <label className="admin-modal-field admin-modal-field-wide"><span>Lesson content or notes</span><textarea name="content" placeholder="Add lesson notes or supporting content" value={form.content} onChange={handleChange} rows="5" /></label>
                    <label className="admin-modal-field"><span>Lesson order</span><input type="number" name="lesson_order" value={form.lesson_order} onChange={handleChange} min="1" required /></label>
                    <div className="admin-modal-actions admin-modal-field-wide">
                        <button type="button" className="btn-secondary" onClick={() => { resetForm(); setIsLessonModalOpen(false); }}>Cancel</button>
                        <button type="submit" className="btn-primary"><MaterialIcon name={editingLessonId ? 'save' : 'add_circle'} /> {editingLessonId ? 'Update lesson' : 'Add lesson'}</button>
                    </div>
                </form>
            </AdminFormModal>
        </div>
    );
};

export default AdminLessons;
