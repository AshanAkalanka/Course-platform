import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import MaterialIcon from '../components/MaterialIcon';
import { useAuth } from '../context/useAuth';
import { getAssetUrl } from '../utils/media';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [profileForm, setProfileForm] = useState({ name: '', email: '', profile_image: null });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                setProfileForm({
                    name: response.data.name || '',
                    email: response.data.email || '',
                    profile_image: null
                });
                setImagePreview(response.data.profile_image ? getAssetUrl(response.data.profile_image) : '');
            } catch (error) {
                setErrorMessage(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };
        void loadProfile();
    }, []);

    useEffect(() => {
        if (!profileForm.profile_image) return undefined;
        const objectUrl = URL.createObjectURL(profileForm.profile_image);
        setImagePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [profileForm.profile_image]);

    const handleProfileChange = (event) => {
        const { name, value, files } = event.target;
        const selectedFile = files?.[0];

        if (name === 'profile_image' && selectedFile) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setErrorMessage('Choose a JPG, PNG, or WebP image.');
                return;
            }
            if (selectedFile.size > 2 * 1024 * 1024) {
                setErrorMessage('Profile images must be 2 MB or smaller.');
                return;
            }
            setErrorMessage('');
        }

        setProfileForm((current) => ({
            ...current,
            [name]: name === 'profile_image' ? selectedFile || null : value
        }));
    };

    const handlePasswordChange = (event) => {
        setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        setSavingProfile(true);
        setMessage('');
        setErrorMessage('');
        try {
            const payload = new FormData();
            payload.append('name', profileForm.name);
            payload.append('email', profileForm.email);
            if (profileForm.profile_image) payload.append('profile_image', profileForm.profile_image);
            const response = await api.put('/auth/me', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
            updateUser(response.data.user);
            setProfileForm((current) => ({ ...current, profile_image: null }));
            setImagePreview(response.data.user.profile_image ? getAssetUrl(response.data.user.profile_image) : '');
            setMessage('Profile updated successfully.');
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setSavingPassword(true);
        setMessage('');
        setErrorMessage('');
        try {
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setErrorMessage('New passwords do not match.');
                return;
            }
            if (passwordForm.newPassword.length < 6) {
                setErrorMessage('The new password must be at least 6 characters long.');
                return;
            }
            await api.put('/auth/me/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setMessage('Password updated successfully.');
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setSavingPassword(false);
        }
    };

    const roleLabel = user?.role === 'admin' ? 'Administrator' : 'Student';
    const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';

    return (
        <main className="page profile-page">
            <div className="page-header fade-up">
                <p className="eyebrow">Your account</p>
                <h1>Profile settings</h1>
                <p className="page-subtitle">Keep your personal information and account security up to date.</p>
            </div>

            <div className="profile-workspace">
                <aside className="profile-summary-card fade-up">
                    <div className="profile-summary-cover" aria-hidden="true" />
                    <div className="ig-avatar-ring">
                        <label htmlFor="avatarUpload" className="ig-avatar-label" title="Change profile photo">
                            {imagePreview ? (
                                <img src={imagePreview} alt={user?.name || 'Profile'} className="ig-avatar-img" />
                            ) : (
                                <span className="ig-avatar-initials">{initials}</span>
                            )}
                            <span className="ig-avatar-overlay"><MaterialIcon name="photo_camera" filled /></span>
                        </label>
                        <input id="avatarUpload" type="file" name="profile_image" accept="image/*" onChange={handleProfileChange} hidden />
                    </div>
                    <div className="profile-summary-identity">
                        <h2>{user?.name || 'User'}</h2>
                        {user?.email && <p>{user.email}</p>}
                        <span className="ig-role-badge">
                            <MaterialIcon name={user?.role === 'admin' ? 'admin_panel_settings' : 'school'} /> {roleLabel}
                        </span>
                    </div>
                    <div className="profile-photo-help">
                        <MaterialIcon name="image" />
                        <span>
                            <strong>{profileForm.profile_image ? 'New photo selected' : 'Profile photo'}</strong>
                            <small>{profileForm.profile_image ? `${profileForm.profile_image.name} will be uploaded when you save.` : 'Select the avatar above to upload a JPG, PNG, or WebP image up to 2 MB.'}</small>
                        </span>
                    </div>
                </aside>

                <section className="profile-settings-card fade-up delay-1">
                    <div className="ig-alerts">
                        <Alert type="success" message={message} />
                        <Alert type="error" message={errorMessage} />
                    </div>

                    <div className="ig-tabs" role="tablist" aria-label="Profile settings">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'details'}
                            className={`ig-tab${activeTab === 'details' ? ' ig-tab-active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            <MaterialIcon name="person" /> Personal info
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'password'}
                            className={`ig-tab${activeTab === 'password' ? ' ig-tab-active' : ''}`}
                            onClick={() => setActiveTab('password')}
                        >
                            <MaterialIcon name="lock" /> Security
                        </button>
                    </div>

                    <div className="ig-tab-body">
                        {activeTab === 'details' && (loading ? (
                            <div className="ig-skeleton">
                                <div className="ig-skeleton-line" />
                                <div className="ig-skeleton-line short" />
                                <div className="ig-skeleton-line" />
                            </div>
                        ) : (
                            <form onSubmit={handleProfileSubmit} className="ig-form">
                                <div className="profile-form-heading">
                                    <span><MaterialIcon name="person" /></span>
                                    <div><h2>Personal information</h2><p>Update the name and email connected to your account.</p></div>
                                </div>
                                <div className="ig-field">
                                    <label htmlFor="ig-name">Full name</label>
                                    <input id="ig-name" type="text" name="name" value={profileForm.name} onChange={handleProfileChange} required placeholder="Your full name" />
                                </div>
                                <div className="ig-field">
                                    <label htmlFor="ig-email">Email address</label>
                                    <input id="ig-email" type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required placeholder="you@example.com" />
                                </div>
                                <button type="submit" className="ig-save-btn" disabled={savingProfile}>
                                    <MaterialIcon name="save" /> {savingProfile ? 'Saving...' : 'Save changes'}
                                </button>
                            </form>
                        ))}

                        {activeTab === 'password' && (loading ? (
                            <div className="ig-skeleton">
                                <div className="ig-skeleton-line" />
                                <div className="ig-skeleton-line short" />
                                <div className="ig-skeleton-line" />
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordSubmit} className="ig-form">
                                <div className="profile-form-heading">
                                    <span><MaterialIcon name="lock" /></span>
                                    <div><h2>Account security</h2><p>Confirm your current password and use at least 6 characters for the new password.</p></div>
                                </div>
                                <div className="ig-field">
                                    <label htmlFor="ig-current-pw">Current password</label>
                                    <div className="password-input-wrap">
                                        <input id="ig-current-pw" type={showPasswords ? 'text' : 'password'} name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} required placeholder="Enter current password" />
                                        <button type="button" onClick={() => setShowPasswords((current) => !current)} aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}><MaterialIcon name={showPasswords ? 'visibility_off' : 'visibility'} /></button>
                                    </div>
                                </div>
                                <div className="profile-password-grid">
                                    <div className="ig-field">
                                        <label htmlFor="ig-new-pw">New password</label>
                                        <div className="password-input-wrap">
                                            <input id="ig-new-pw" type={showPasswords ? 'text' : 'password'} name="newPassword" minLength={6} value={passwordForm.newPassword} onChange={handlePasswordChange} required placeholder="Enter new password" />
                                            <button type="button" onClick={() => setShowPasswords((current) => !current)} aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}><MaterialIcon name={showPasswords ? 'visibility_off' : 'visibility'} /></button>
                                        </div>
                                    </div>
                                    <div className="ig-field">
                                        <label htmlFor="ig-confirm-pw">Confirm password</label>
                                        <div className="password-input-wrap">
                                            <input id="ig-confirm-pw" type={showPasswords ? 'text' : 'password'} name="confirmPassword" minLength={6} value={passwordForm.confirmPassword} onChange={handlePasswordChange} required placeholder="Repeat new password" />
                                            <button type="button" onClick={() => setShowPasswords((current) => !current)} aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}><MaterialIcon name={showPasswords ? 'visibility_off' : 'visibility'} /></button>
                                        </div>
                                    </div>
                                </div>
                                {passwordForm.newPassword && (
                                    <div className={`password-match-note ${passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword ? 'match' : ''}`}>
                                        <MaterialIcon name={passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword ? 'check_circle' : 'info'} />
                                        {passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword ? 'New passwords match.' : 'Enter the same new password in both fields.'}
                                    </div>
                                )}
                                <button type="submit" className="ig-save-btn" disabled={savingPassword}>
                                    <MaterialIcon name="password" /> {savingPassword ? 'Updating...' : 'Update password'}
                                </button>
                            </form>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Profile;
