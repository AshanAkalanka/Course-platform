import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import { getAssetUrl } from '../utils/media';
import MaterialIcon from '../components/MaterialIcon';
import { isDefaultCategory } from '../data/categoryCatalog';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminFormModal from '../components/AdminFormModal';

const initialForm = {
    title: '',
    description: '',
    category: '',
    level: '',
    thumbnail: null
};

const COURSE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [existingThumbnail, setExistingThumbnail] = useState('');
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [coursesRes, categoriesRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/admin/categories')
                ]);
                setCourses(coursesRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            }
        };

        void loadData();
    }, []);

    useEffect(() => {
        if (!form.thumbnail) {
            setThumbnailPreview('');
            return undefined;
        }

        const objectUrl = URL.createObjectURL(form.thumbnail);
        setThumbnailPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [form.thumbnail]);

    useEffect(() => {
        if (!isCourseModalOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !loading) {
                setIsCourseModalOpen(false);
                setForm(initialForm);
                setEditingId(null);
                setExistingThumbnail('');
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCourseModalOpen, loading]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'thumbnail') {
            setForm({ ...form, thumbnail: files[0] });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId(null);
        setExistingThumbnail('');
    };

    const openCreateModal = () => {
        resetForm();
        setMessage('');
        setErrorMessage('');
        setIsCourseModalOpen(true);
    };

    const closeCourseModal = () => {
        if (loading) return;
        resetForm();
        setIsCourseModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setErrorMessage('');
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', form.title);
            data.append('description', form.description);
            data.append('category', form.category);
            data.append('level', form.level);
            if (form.thumbnail) {
                data.append('thumbnail', form.thumbnail);
            }

            if (editingId) {
                await api.put(`/courses/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setMessage('Course updated successfully');
            } else {
                await api.post('/courses', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setMessage('Course created successfully');
            }

            resetForm();
            setIsCourseModalOpen(false);
            const [coursesRes, categoriesRes] = await Promise.all([
                api.get('/courses'),
                api.get('/admin/categories')
            ]);
            setCourses(coursesRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course) => {
        const matchingCategory = categories.find(
            (category) => category.toLowerCase() === course.category?.trim().toLowerCase()
        );
        const matchingLevel = COURSE_LEVELS.find(
            (level) => level.toLowerCase() === course.level?.trim().toLowerCase()
        );
        setForm({
            title: course.title,
            description: course.description,
            category: matchingCategory || course.category || '',
            level: matchingLevel || course.level || '',
            thumbnail: null
        });
        setEditingId(course.id);
        setExistingThumbnail(getImageUrl(course.thumbnail));
        setMessage('');
        setErrorMessage('');
        setIsCourseModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this course?');
        if (!confirmDelete) return;

        try {
            await api.delete(`/courses/${id}`);
            setMessage('Course deleted successfully');
            const [coursesRes, categoriesRes] = await Promise.all([
                api.get('/courses'),
                api.get('/admin/categories')
            ]);
            setCourses(coursesRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();

        try {
            await api.post('/admin/categories', { name: newCategory });
            const res = await api.get('/admin/categories');
            setCategories(res.data);
            setForm((current) => ({ ...current, category: newCategory.trim() }));
            setNewCategory('');
            setMessage('Category created successfully');
            setErrorMessage('');
            setIsCategoryModalOpen(false);
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        }
    };

    const handleDeleteCategory = async (categoryName) => {
        try {
            await api.delete(`/admin/categories/${encodeURIComponent(categoryName)}`);
            const res = await api.get('/admin/categories');
            setCategories(res.data);
            if (form.category === categoryName) {
                setForm((current) => ({ ...current, category: '' }));
            }
            setMessage('Category deleted successfully');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80';
        return getAssetUrl(path);
    };

    const levelCount = new Set(courses.map((course) => course.level).filter(Boolean)).size;
    const levelOptions = form.level && !COURSE_LEVELS.includes(form.level)
        ? [form.level, ...COURSE_LEVELS]
        : COURSE_LEVELS;
    const defaultCategories = categories.filter((category) => isDefaultCategory(category));
    const customCategories = categories.filter((category) => !isDefaultCategory(category));

    return (
        <div className="page admin-workspace-page admin-courses-page">
            <AdminPageHeader
                icon="auto_stories"
                eyebrow="Learning content"
                title="Course catalog"
                description="Create categories, publish courses, and keep every catalog entry easy to review."
                tone="blue"
            />

            <div className="admin-page-metrics fade-up" aria-label="Course catalog summary">
                <article><span className="blue"><MaterialIcon name="auto_stories" /></span><div><strong>{courses.length}</strong><small>Courses</small></div></article>
                <article><span className="purple"><MaterialIcon name="category" /></span><div><strong>{categories.length}</strong><small>Categories</small></div></article>
                <article><span className="green"><MaterialIcon name="signal_cellular_alt" /></span><div><strong>{levelCount}</strong><small>Learning levels</small></div></article>
            </div>

            <div className="admin-page-primary-action fade-up">
                <div><strong>Manage the course catalog</strong><span>Add a new course or edit an existing entry from the library below.</span></div>
                <button type="button" className="btn-primary" onClick={openCreateModal}><MaterialIcon name="add_circle" /> Create course</button>
            </div>

            <Alert type="success" message={message} />
            <Alert type="error" message={errorMessage} />

            <section className="admin-form category-manager admin-category-panel fade-up">
                <div className="category-manager-header">
                    <div>
                        <h3>Course categories</h3>
                        <p className="category-manager-copy">Review available categories or add a custom category.</p>
                    </div>
                    <button type="button" className="btn-primary" onClick={() => { setErrorMessage(''); setIsCategoryModalOpen(true); }}><MaterialIcon name="add" /> Add category</button>
                </div>

                <div className="category-collection">
                    <section className="category-collection-group">
                        <div className="category-collection-heading">
                            <div><strong>Default categories</strong><small>Built into the EduFlow catalog</small></div>
                            <span>{defaultCategories.length}</span>
                        </div>
                        <div className="category-compact-grid">
                            {defaultCategories.map((category) => (
                                <div key={category} className="category-compact-card default">
                                    <span className="category-compact-icon"><MaterialIcon name="verified" /></span>
                                    <div><strong>{category}</strong><small>Default</small></div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="category-collection-group custom">
                        <div className="category-collection-heading">
                            <div><strong>Custom categories</strong><small>Created by administrators</small></div>
                            <span>{customCategories.length}</span>
                        </div>
                        {customCategories.length ? (
                            <div className="category-compact-grid">
                                {customCategories.map((category) => (
                                    <div key={category} className="category-compact-card custom">
                                        <span className="category-compact-icon"><MaterialIcon name="category" /></span>
                                        <div><strong>{category}</strong><small>Custom</small></div>
                                        <button type="button" onClick={() => handleDeleteCategory(category)} aria-label={`Remove ${category}`} title={`Remove ${category}`}><MaterialIcon name="delete" /></button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="category-custom-empty"><MaterialIcon name="add_circle" /><span>No custom categories yet.</span></div>
                        )}
                    </section>
                </div>
            </section>

            <div className="admin-table-wrapper admin-data-panel fade-up">
                <div className="admin-section-title">
                    <div><span><MaterialIcon name="view_list" /></span><div><h3>Course library</h3><p>Review and update every published course.</p></div></div>
                    <strong>{courses.length} total</strong>
                </div>
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Thumbnail</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Level</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {courses.map((course) => (
                        <tr key={course.id}>
                            <td>{course.id}</td>
                            <td>
                                <img
                                    src={getImageUrl(course.thumbnail)}
                                    alt={course.title}
                                    className="table-thumb"
                                />
                            </td>
                            <td>{course.title}</td>
                            <td>{course.category}</td>
                            <td>{course.level}</td>
                            <td className="table-actions">
                                <button className="btn-small edit-btn" onClick={() => handleEdit(course)}>
                                    <MaterialIcon name="edit" /> Edit
                                </button>
                                <button className="btn-small delete-btn" onClick={() => handleDelete(course.id)}>
                                    <MaterialIcon name="delete" /> Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {isCourseModalOpen && (
                <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeCourseModal()}>
                    <section className="admin-course-modal" role="dialog" aria-modal="true" aria-labelledby="course-modal-title">
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-modal-icon"><MaterialIcon name={editingId ? 'edit_note' : 'add_circle'} /></span>
                                <div><p>{editingId ? 'Update catalog entry' : 'New catalog entry'}</p><h2 id="course-modal-title">{editingId ? 'Edit course' : 'Create course'}</h2></div>
                            </div>
                            <button type="button" className="admin-modal-close" onClick={closeCourseModal} disabled={loading} aria-label="Close course form"><MaterialIcon name="close" /></button>
                        </div>

                        <form className="admin-course-modal-form" onSubmit={handleSubmit}>
                            {errorMessage && <div className="admin-modal-field-wide"><Alert type="error" message={errorMessage} /></div>}

                            <label className="admin-modal-field admin-modal-field-wide">
                                <span>Course title</span>
                                <input type="text" name="title" placeholder="Enter a clear course title" value={form.title} onChange={handleChange} required autoFocus />
                            </label>

                            <label className="admin-modal-field admin-modal-field-wide">
                                <span>Description</span>
                                <textarea name="description" placeholder="Explain what students will learn" value={form.description} onChange={handleChange} rows="5" required />
                            </label>

                            <label className="admin-modal-field">
                                <span>Category</span>
                                <select name="category" value={form.category} onChange={handleChange} required>
                                    <option value="">Select category</option>
                                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                                </select>
                            </label>

                            <label className="admin-modal-field">
                                <span>Learning level</span>
                                <select name="level" value={form.level} onChange={handleChange} required>
                                    <option value="">Select learning level</option>
                                    {levelOptions.map((level) => <option key={level} value={level}>{level}</option>)}
                                </select>
                            </label>

                            <label className="admin-modal-field admin-modal-field-wide">
                                <span>Course thumbnail</span>
                                <input type="file" name="thumbnail" accept="image/*" onChange={handleChange} />
                            </label>

                            {(thumbnailPreview || existingThumbnail) && (
                                <div className="admin-modal-preview admin-modal-field-wide">
                                    <img src={thumbnailPreview || existingThumbnail} alt="Course thumbnail preview" />
                                    <span>{thumbnailPreview ? 'New thumbnail preview' : 'Current thumbnail'}</span>
                                </div>
                            )}

                            <div className="admin-modal-actions admin-modal-field-wide">
                                <button type="button" className="btn-secondary" onClick={closeCourseModal} disabled={loading}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    <MaterialIcon name={editingId ? 'save' : 'add_circle'} />
                                    {loading ? 'Saving...' : editingId ? 'Update course' : 'Create course'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            <AdminFormModal
                open={isCategoryModalOpen}
                onClose={() => { setIsCategoryModalOpen(false); setNewCategory(''); setErrorMessage(''); }}
                icon="category"
                eyebrow="Catalog organization"
                title="Create category"
            >
                <form className="admin-course-modal-form admin-simple-modal-form" onSubmit={handleCreateCategory}>
                    {errorMessage && <div className="admin-modal-field-wide"><Alert type="error" message={errorMessage} /></div>}
                    <label className="admin-modal-field admin-modal-field-wide">
                        <span>Category name</span>
                        <input type="text" placeholder="Enter a unique category name" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} required autoFocus />
                    </label>
                    <div className="admin-modal-actions admin-modal-field-wide">
                        <button type="button" className="btn-secondary" onClick={() => { setIsCategoryModalOpen(false); setNewCategory(''); }}>Cancel</button>
                        <button type="submit" className="btn-primary"><MaterialIcon name="add" /> Create category</button>
                    </div>
                </form>
            </AdminFormModal>
        </div>
    );
};

export default AdminCourses;
