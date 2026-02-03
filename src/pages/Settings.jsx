import { useState, useEffect } from 'react';
import { usersAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogOut, ChevronRight, ShieldCheck } from 'lucide-react';

const Settings = () => {
    const { user, fetchUser, logout } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [loadingUsername, setLoadingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [usernameSuccess, setUsernameSuccess] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setUsername(user.username);
        }
    }, [user]);

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        if (username.trim() === user.username) return;

        setLoadingUsername(true);
        setUsernameError('');
        setUsernameSuccess('');

        try {
            await usersAPI.updateMe({ username: username.trim() });
            await fetchUser();
            setUsernameSuccess('Username updated successfully');
        } catch (error) {
            setUsernameError(error.response?.data?.detail || 'Failed to update username');
        } finally {
            setLoadingUsername(false);
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

    return (
        <div className="min-h-screen">
            <div className="px-6 py-8">
                <h1 className="text-[26px] font-bold text-[#f3f5f7] mb-10">Settings</h1>

                {/* Account Settings */}
                <div className="bg-[#121212] border border-[#1a1a1a] rounded-3xl p-6 sm:p-8 mb-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-white/5 rounded-xl">
                            <User size={20} className="text-[#f3f5f7]" />
                        </div>
                        <h2 className="text-[18px] font-bold text-[#f3f5f7]">Account settings</h2>
                    </div>

                    <form onSubmit={handleUpdateUsername}>
                        {usernameError && <div className="bg-red-500/5 border border-red-500/10 text-red-500 p-4 rounded-2xl text-[14px] mb-6 animate-in fade-in duration-300">{usernameError}</div>}
                        {usernameSuccess && <div className="bg-green-500/5 border border-green-500/10 text-green-500 p-4 rounded-2xl text-[14px] mb-6 animate-in fade-in duration-300">{usernameSuccess}</div>}

                        <div className="mb-8">
                            <label className="block text-[14px] font-bold text-[#444] mb-3 px-1 uppercase tracking-wider">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.trim())}
                                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-2xl px-5 py-4 text-[#f3f5f7] outline-none focus:border-[#444] transition-all duration-300 placeholder-[#333]"
                                placeholder="Username"
                            />
                            <p className="text-[12px] text-[#444] mt-3 px-1 font-medium">Usernames must be unique across the platform.</p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-[#e1e1e1] active:scale-[0.98] transition-all disabled:opacity-20 shadow-md antialiased"
                            disabled={loadingUsername || username === user?.username}
                        >
                            {loadingUsername ? 'Updating...' : 'Update username'}
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
        </div>
    );

};

export default Settings;

