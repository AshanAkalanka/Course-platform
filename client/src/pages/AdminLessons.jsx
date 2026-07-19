import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <div className="page">
            <div className="page-header">
                <p className="eyebrow">Admin lessons</p>
                <h2>Organize lessons inside each course.</h2>
                <p className="page-subtitle">Pick a course, add lessons in order, and assign a video URL for playback.</p>
            </div>

            <Alert type="success" message={message} />
            <Alert type="error" message={errorMessage} />

            <div className="admin-form fade-up">
                <h3>Select Course</h3>
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
                    <form className="admin-form fade-up" onSubmit={handleSubmit}>
                        <h3>{editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}</h3>

                        <input
                            type="text"
                            name="title"
                            placeholder="Lesson Title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="video_url"
                            placeholder="Video URL"
                            value={form.video_url}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            name="content"
                            placeholder="Lesson Content / Notes"
                            value={form.content}
                            onChange={handleChange}
                            rows="5"
                        />

                        <input
                            type="number"
                            name="lesson_order"
                            placeholder="Lesson Order"
                            value={form.lesson_order}
                            onChange={handleChange}
                            min="1"
                            required
                        />

                        <div className="admin-form-actions">
                            <button type="submit" className="btn-primary">
                                <MaterialIcon name={editingLessonId ? 'save' : 'add_circle'} />
                                {editingLessonId ? 'Update Lesson' : 'Add Lesson'}
                            </button>

                            {editingLessonId && (
                                <button type="button" className="btn-secondary" onClick={resetForm}>
                                    <MaterialIcon name="close" /> Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="admin-table-wrapper fade-up">
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
                            <p style={{ marginTop: '16px' }}>No lessons added for this course yet.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminLessons;
