import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminFormModal from '../components/AdminFormModal';

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
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

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
            setIsMaterialModalOpen(false);
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
    const selectedCourse = courses.find((course) => String(course.id) === String(selectedCourseId));

    return (
        <div className="page admin-workspace-page admin-materials-page">
            <AdminPageHeader
                icon="folder_open"
                eyebrow="Learning content"
                title="Course materials"
                description="Keep downloadable files, media, notices, and course messages organized in one library."
                tone="cyan"
            />

            <div className="admin-page-metrics fade-up" aria-label="Course material summary">
                <article><span className="blue"><MaterialIcon name="auto_stories" /></span><div><strong>{courses.length}</strong><small>Available courses</small></div></article>
                <article><span className="cyan"><MaterialIcon name="folder_open" /></span><div><strong>{materials.length}</strong><small>Materials in view</small></div></article>
                <article className="admin-metric-wide"><span className="green"><MaterialIcon name="check_circle" /></span><div><strong>{selectedCourse?.title || 'None selected'}</strong><small>Current course</small></div></article>
            </div>

            <Alert type="success" message={message} />
            <Alert type="error" message={error} />

            <div className="admin-form admin-course-picker fade-up">
                <div className="admin-form-heading"><span><MaterialIcon name="school" /></span><div><h3>Select course</h3><p>Choose which course material library you want to manage.</p></div></div>
                <select value={selectedCourseId} onChange={e => { setSelectedCourseId(e.target.value); setIsMaterialModalOpen(false); }}>
                    <option value="">Choose a course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>

            {selectedCourseId && (
                <>
                    <div className="admin-page-primary-action fade-up">
                        <div><strong>Add to this course library</strong><span>Upload a file, publish a notice, or send a course message.</span></div>
                        <button type="button" className="btn-primary" onClick={() => { setForm(initialForm); setFile(null); setError(''); setIsMaterialModalOpen(true); }}><MaterialIcon name="upload_file" /> Add material</button>
                    </div>

                    <div className="admin-table-wrapper admin-data-panel fade-up">
                        <div className="admin-section-title">
                            <div><span><MaterialIcon name="folder_copy" /></span><div><h3>Uploaded materials</h3><p>Files and updates available for this course.</p></div></div>
                            <strong>{materials.length} total</strong>
                        </div>
                        {materials.length === 0 ? (
                            <div className="empty-state admin-panel-empty">No materials uploaded yet.</div>
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

            <AdminFormModal
                open={isMaterialModalOpen}
                onClose={() => { if (!loading) { setIsMaterialModalOpen(false); setForm(initialForm); setFile(null); setError(''); } }}
                icon="upload_file"
                eyebrow={selectedCourse?.title || 'Course library'}
                title="Add course material"
                disableClose={loading}
            >
                <form className="admin-course-modal-form" onSubmit={handleSubmit}>
                    {error && <div className="admin-modal-field-wide"><Alert type="error" message={error} /></div>}
                    <label className="admin-modal-field"><span>Material type</span><select value={form.type} onChange={event => { setForm({ ...initialForm, type: event.target.value }); setFile(null); }}><option value="pdf">PDF document</option><option value="video">Video file</option><option value="image">Image</option><option value="notice">Notice</option><option value="message">Message</option></select></label>
                    <label className="admin-modal-field"><span>Title</span><input type="text" placeholder="Enter a material title" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} required autoFocus /></label>
                    {isFileType && <label className="admin-modal-field admin-modal-field-wide"><span>Choose file</span><input type="file" accept={form.type === 'pdf' ? '.pdf' : form.type === 'video' ? 'video/*' : 'image/*'} onChange={event => setFile(event.target.files[0])} required /></label>}
                    {isTextType && <label className="admin-modal-field admin-modal-field-wide"><span>{form.type === 'notice' ? 'Notice content' : 'Message content'}</span><textarea placeholder="Write the content students will receive" value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} rows="5" required /></label>}
                    <div className="admin-modal-actions admin-modal-field-wide">
                        <button type="button" className="btn-secondary" onClick={() => { setIsMaterialModalOpen(false); setForm(initialForm); setFile(null); }} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}><MaterialIcon name="upload_file" /> {loading ? 'Uploading...' : 'Add material'}</button>
                    </div>
                </form>
            </AdminFormModal>
        </div>
    );
};

export default AdminCourseMaterials;
