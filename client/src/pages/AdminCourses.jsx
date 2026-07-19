import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import { getAssetUrl } from '../utils/media';
import MaterialIcon from '../components/MaterialIcon';

const initialForm = {
    title: '',
    description: '',
    category: '',
    level: '',
    thumbnail: null
};

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
        setForm({
            title: course.title,
            description: course.description,
            category: course.category || '',
            level: course.level || '',
            thumbnail: null
        });
        setEditingId(course.id);
        setMessage('');
        setErrorMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <div className="page">
            <div className="page-header">
                <p className="eyebrow">Admin courses</p>
                <h2>Manage courses, categories, and course presentation.</h2>
                <p className="page-subtitle">Create categories first, then build organized course pages with thumbnails and levels.</p>
            </div>

            <Alert type="success" message={message} />
            <Alert type="error" message={errorMessage} />

            <form className="admin-form category-manager fade-up" onSubmit={handleCreateCategory}>
                <div className="category-manager-header">
                    <div>
                        <h3>Create Category</h3>
                        <p className="category-manager-copy">Create categories first, then assign them to courses from the dropdown.</p>
                    </div>
                </div>

                <div className="category-manager-row">
                    <input
                        type="text"
                        placeholder="New category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary"><MaterialIcon name="add" /> Add Category</button>
                </div>

                {categories.length > 0 && (
                    <div className="category-chip-list">
                        {categories.map((category) => (
                            <div key={category} className="category-chip">
                                <span className="category-chip-name">{category}</span>
                                <button
                                    type="button"
                                    className="btn-small delete-btn"
                                    onClick={() => handleDeleteCategory(category)}
                                >
                                    <MaterialIcon name="close" /> Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </form>

            <form className="admin-form fade-up" onSubmit={handleSubmit}>
                <h3>{editingId ? 'Edit Course' : 'Add New Course'}</h3>

                <input
                    type="text"
                    name="title"
                    placeholder="Course Title"
                    value={form.title}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="description"
                    placeholder="Course Description"
                    value={form.description}
                    onChange={handleChange}
                    rows="5"
                    required
                />

                <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    name="level"
                    placeholder="Level"
                    value={form.level}
                    onChange={handleChange}
                />

                <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleChange}
                />

                {thumbnailPreview && (
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="form-image-preview" />
                )}

                <div className="admin-form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        <MaterialIcon name={editingId ? 'save' : 'add_circle'} />
                        {loading ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
                    </button>

                    {editingId && (
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
        </div>
    );
};

export default AdminCourses;
