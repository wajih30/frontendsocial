import { useState, useEffect } from 'react';
import { usersAPI, uploadAPI, aiAPI, API_BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogOut, ChevronRight, ShieldCheck, Camera, Loader2, Sparkles, X } from 'lucide-react';
import { useRef } from 'react';

const Settings = () => {
    const { user, fetchUser, logout } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [settingsError, setSettingsError] = useState('');
    const [settingsSuccess, setSettingsSuccess] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // AI Bio Generator State
    const [showBioModal, setShowBioModal] = useState(false);
    const [bioKeywords, setBioKeywords] = useState('');
    const [bioSuggestions, setBioSuggestions] = useState([]);
    const [loadingBio, setLoadingBio] = useState(false);
    const [bioError, setBioError] = useState('');

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setBio(user.bio || '');
        }
    }, [user]);

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const uploadResponse = await uploadAPI.uploadFile(file);
            await usersAPI.updateMe({ profile_picture_url: uploadResponse.data.url });
            await fetchUser();
        } catch (error) {
            console.error('Failed to update profile picture:', error);
            setSettingsError(error.response?.data?.detail || 'Failed to upload image. Please check file size and type.');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const hasChanges = username.trim() !== user.username || bio.trim() !== (user.bio || '');
        if (!hasChanges) return;

        setLoadingSettings(true);
        setSettingsError('');
        setSettingsSuccess('');

        try {
            await usersAPI.updateMe({
                username: username.trim(),
                bio: bio.trim()
            });
            await fetchUser();
            setSettingsSuccess('Profile updated successfully');
        } catch (error) {
            setSettingsError(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setLoadingSettings(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return;
        }

        setLoadingPassword(true);

        try {
            await usersAPI.updatePassword(currentPassword, newPassword);
            setPasswordSuccess('Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPasswordError(error.response?.data?.detail || 'Failed to update password');
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleGenerateBio = async () => {
        if (!bioKeywords.trim()) {
            setBioError('Please enter some keywords first');
            return;
        }
        setLoadingBio(true);
        setBioError('');
        setBioSuggestions([]);
        try {
            const response = await aiAPI.generateBio(bioKeywords);
            setBioSuggestions(response.data.suggestions || []);
        } catch (error) {
            setBioError(error.response?.data?.detail || 'Failed to generate bio');
        } finally {
            setLoadingBio(false);
        }
    };

    const handleSelectBio = (selectedBio) => {
        setBio(selectedBio);
        setShowBioModal(false);
        setBioKeywords('');
        setBioSuggestions([]);
    };

    return (
        <div className="min-h-screen">
            <div className="px-6 py-8">
                <h1 className="text-[26px] font-bold text-[#f3f5f7] mb-10">Settings</h1>

                {/* Profile Picture Section */}
                <div className="bg-[#121212] border border-[#1a1a1a] rounded-3xl p-6 sm:p-8 mb-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-white/5 rounded-xl">
                            <Camera size={20} className="text-[#f3f5f7]" />
                        </div>
                        <h2 className="text-[18px] font-bold text-[#f3f5f7]">Profile picture</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-[#0a0a0a] border border-[#262626] overflow-hidden flex items-center justify-center">
                                {user?.profile_picture_url ? (
                                    <img src={`${API_BASE_URL}${user.profile_picture_url}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white">{user?.username?.[0].toUpperCase()}</span>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                        <Loader2 className="text-white animate-spin" size={24} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-white font-bold text-[16px] mb-1">Your profile photo</h3>
                            <p className="text-[#444] text-[13px] mb-4">Click below to upload a new avatar. Square images work best.</p>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="bg-[#262626] hover:bg-[#333] text-white font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Change Photo'}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureChange}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-[#121212] border border-[#1a1a1a] rounded-3xl p-6 sm:p-8 mb-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-white/5 rounded-xl">
                            <User size={20} className="text-[#f3f5f7]" />
                        </div>
                        <h2 className="text-[18px] font-bold text-[#f3f5f7]">Account settings</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile}>
                        {settingsError && <div className="bg-red-500/5 border border-red-500/10 text-red-500 p-4 rounded-2xl text-[14px] mb-6 animate-in fade-in duration-300">{settingsError}</div>}
                        {settingsSuccess && <div className="bg-green-500/5 border border-green-500/10 text-green-500 p-4 rounded-2xl text-[14px] mb-6 animate-in fade-in duration-300">{settingsSuccess}</div>}

                        <div className="mb-6">
                            <label className="block text-[14px] font-bold text-[#444] mb-3 px-1 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                readOnly
                                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-2xl px-5 py-4 text-[#777] outline-none cursor-not-allowed"
                            />
                            <p className="text-[12px] text-[#444] mt-2 px-1 font-medium">Email cannot be changed.</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-[14px] font-bold text-[#444] mb-3 px-1 uppercase tracking-wider">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.trim())}
                                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-2xl px-5 py-4 text-[#f3f5f7] outline-none focus:border-[#444] transition-all duration-300 placeholder-[#333]"
                                placeholder="Username"
                            />
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <label className="text-[14px] font-bold text-[#444] uppercase tracking-wider">Bio</label>
                                <button
                                    type="button"
                                    onClick={() => setShowBioModal(true)}
                                    className="flex items-center gap-1.5 text-[13px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    <Sparkles size={14} />
                                    Generate with AI
                                </button>
                            </div>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-2xl px-5 py-4 text-[#f3f5f7] outline-none focus:border-[#444] transition-all duration-300 placeholder-[#333] min-h-[100px] resize-none"
                                placeholder="Tell us about yourself..."
                            />
                            <p className="text-[12px] text-[#444] mt-3 px-1 font-medium">Brief description for your profile.</p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-[#e1e1e1] active:scale-[0.98] transition-all disabled:opacity-20 shadow-md antialiased"
                            disabled={loadingSettings || (username === user?.username && bio === (user?.bio || ''))}
                        >
                            {loadingSettings ? 'Updating...' : 'Update profile'}
                        </button>
                    </form>
                </div>

                {/* Security Settings */}
                <div className="bg-[#121212] border border-[#1a1a1a] rounded-3xl p-6 sm:p-8 mb-10 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-white/5 rounded-xl">
                            <Lock size={20} className="text-[#f3f5f7]" />
                        </div>
                        <h2 className="text-[18px] font-bold text-[#f3f5f7]">Security</h2>
                    </div>

                    <form onSubmit={handleUpdatePassword}>
                        {passwordError && <div className="bg-red-500/5 border border-red-500/10 text-red-500 p-4 rounded-2xl text-[14px] mb-6 animate-in fade-in duration-300">{passwordError}</div>}
                        {passwordSuccess && <div className="bg-green-500/5 border border-green-500/10 text-green-500 p-4 rounded-2xl text-[14px] mb-6 animate-in fade-in duration-300">{passwordSuccess}</div>}

                        <div className="space-y-6 mb-8">
                            <div>
                                <label className="block text-[14px] font-bold text-[#444] mb-3 px-1 uppercase tracking-wider">Current password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-2xl px-5 py-4 text-[#f3f5f7] outline-none focus:border-[#444] transition-all duration-300 placeholder-[#333]"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-bold text-[#444] mb-3 px-1 uppercase tracking-wider">New password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-2xl px-5 py-4 text-[#f3f5f7] outline-none focus:border-[#444] transition-all duration-300 placeholder-[#333]"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-bold text-[#444] mb-3 px-1 uppercase tracking-wider">Confirm new password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-2xl px-5 py-4 text-[#f3f5f7] outline-none focus:border-[#444] transition-all duration-300 placeholder-[#333]"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-[#e1e1e1] active:scale-[0.98] transition-all disabled:opacity-20 shadow-md antialiased"
                            disabled={loadingPassword}
                        >
                            {loadingPassword ? 'Updating...' : 'Update password'}
                        </button>
                    </form>
                </div>

                {/* Logout Section */}
                <button
                    onClick={logout}
                    className="w-full bg-[#121212] border border-[#ff3040]/30 text-[#ff3040] font-bold py-5 rounded-3xl hover:bg-[#ff3040]/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 antialiased"
                >
                    <LogOut size={20} strokeWidth={2.5} />
                    Log out
                </button>
            </div>
            {/* Height Spacer for Mobile */}
            <div className="h-20 sm:hidden"></div>

            {/* AI Bio Generator Modal */}
            {showBioModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-[#262626] rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 fade-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-xl">
                                    <Sparkles size={20} className="text-indigo-400" />
                                </div>
                                <h3 className="text-[18px] font-bold text-white">AI Bio Generator</h3>
                            </div>
                            <button
                                onClick={() => { setShowBioModal(false); setBioKeywords(''); setBioSuggestions([]); setBioError(''); }}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-[#777]" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-[#777] text-[14px] mb-4">Enter keywords that describe you (e.g., "photographer, traveler, coffee lover")</p>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={bioKeywords}
                                    onChange={(e) => setBioKeywords(e.target.value)}
                                    placeholder="Your keywords..."
                                    className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-colors placeholder-[#444]"
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateBio()}
                                />
                                <button
                                    onClick={handleGenerateBio}
                                    disabled={loadingBio || !bioKeywords.trim()}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-5 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loadingBio ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                    {loadingBio ? 'Generating...' : 'Generate'}
                                </button>
                            </div>

                            {bioError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-[13px] mb-4">
                                    {bioError}
                                </div>
                            )}

                            {/* Suggestions */}
                            {bioSuggestions.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[#555] text-[12px] font-semibold uppercase tracking-wider">Choose a bio:</p>
                                    {bioSuggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectBio(suggestion)}
                                            className="w-full text-left p-4 bg-[#0a0a0a] border border-[#262626] rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-[#e1e1e1] text-[14px]"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default Settings;

