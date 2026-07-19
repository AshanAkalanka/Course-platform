import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';

const TYPE_ICONS = { pdf: 'picture_as_pdf', video: 'movie', image: 'image', notice: 'campaign', message: 'mail' };
const FILE_TYPES = ['pdf', 'video', 'image'];
const TEXT_TYPES = ['notice', 'message'];

const initialForm = { type: 'pdf', title: '', content: '' };

const AdminCourseMaterials = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [materials, setMaterials] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/courses').then(res => setCourses(res.data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (!selectedCourseId) { setMaterials([]); return; }
        api.get(`/materials/${selectedCourseId}`)
            .then(res => setMaterials(res.data))
            .catch(err => setError(getErrorMessage(err)));
    }, [selectedCourseId]);

    const isFileType = FILE_TYPES.includes(form.type);
    const isTextType = TEXT_TYPES.includes(form.type);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourseId) return setError('Select a course first.');
        setLoading(true);
        setMessage(''); setError('');

        try {
            const data = new FormData();
            data.append('type', form.type);
            data.append('title', form.title);
            if (isTextType) data.append('content', form.content);
            if (isFileType && file) data.append('file', file);

            await api.post(`/materials/${selectedCourseId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Material uploaded successfully.');
            setForm(initialForm);
            setFile(null);
            e.target.reset();
            const res = await api.get(`/materials/${selectedCourseId}`);
            setMaterials(res.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this material?')) return;
        try {
            await api.delete(`/materials/${id}`);
            setMaterials(prev => prev.filter(m => m.id !== id));
            setMessage('Material deleted.');
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const getFileUrl = (path) => `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${path}`;

    return (
        <div className="page">
            <div className="page-header fade-up">
                <p className="eyebrow">Admin</p>
                <h2>Course Materials</h2>
                <p className="page-subtitle">Upload PDFs, videos, images, notices, and messages for each course.</p>
            </div>

            <Alert type="success" message={message} />
            <Alert type="error" message={error} />

            {/* Course Selector */}
            <div className="admin-form fade-up">
                <h3>Select Course</h3>
                <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                    <option value="">Choose a course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>

            {selectedCourseId && (
                <>
                    {/* Upload Form */}
                    <form className="admin-form fade-up" onSubmit={handleSubmit}>
                        <h3>Add New Material</h3>

                        <select value={form.type} onChange={e => setForm({ ...initialForm, type: e.target.value })}>
                            <option value="pdf">PDF Document</option>
                            <option value="video">Video File</option>
                            <option value="image">Image</option>
                            <option value="notice">Notice</option>
                            <option value="message">Message</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Title"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                        />

                        {isFileType && (
                            <input
                                type="file"
                                accept={form.type === 'pdf' ? '.pdf' : form.type === 'video' ? 'video/*' : 'image/*'}
                                onChange={e => setFile(e.target.files[0])}
                                required
                                style={{ padding: '10px 0' }}
                            />
                        )}

                        {isTextType && (
                            <textarea
                                placeholder={form.type === 'notice' ? 'Notice content...' : 'Message content...'}
                                value={form.content}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                rows="5"
                                required
                            />
                        )}

                        <div className="admin-form-actions">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                <MaterialIcon name="upload_file" /> {loading ? 'Uploading...' : 'Upload Material'}
                            </button>
                        </div>
                    </form>

                    {/* Materials List */}
                    <div className="admin-table-wrapper fade-up">
                        <h3 style={{ padding: '0 20px 12px' }}>Uploaded Materials</h3>
                        {materials.length === 0 ? (
                            <div className="empty-state" style={{ margin: '0 20px 20px' }}>No materials uploaded yet.</div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Title</th>
                                        <th>Content / File</th>
                                        <th>Uploaded</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.map(mat => (
                                        <tr key={mat.id}>
                                            <td>
                                                <MaterialIcon name={TYPE_ICONS[mat.type]} />
                                                {' '}{mat.type}
                                            </td>
                                            <td><strong>{mat.title}</strong></td>
                                            <td>
                                                {mat.file_path ? (
                                                    <a href={getFileUrl(mat.file_path)} target="_blank" rel="noreferrer" className="btn-ghost btn-small">
                                                        <MaterialIcon name="open_in_new" /> View File
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                        {mat.content?.substring(0, 60)}{mat.content?.length > 60 ? '…' : ''}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                {new Date(mat.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <button className="btn-small delete-btn" onClick={() => handleDelete(mat.id)}>
                                                    <MaterialIcon name="delete" /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminCourseMaterials;
