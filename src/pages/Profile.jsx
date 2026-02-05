import { useState, useEffect, useRef } from 'react';
import { Camera, Grid, User as UserIcon, Settings, Edit3, Share2 } from 'lucide-react';
import { usersAPI, socialAPI, uploadAPI, API_BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import UserListModal from '../components/UserListModal';

const Profile = () => {
    const [posts, setPosts] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { user, fetchUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchAllData();
            setFormData({
                username: user.username,
                full_name: user.full_name || '',
                bio: user.bio || '',
            });
        }
    }, [user]);

    const fetchAllData = async () => {
        try {
            const [postsRes, followersRes, followingRes] = await Promise.all([
                socialAPI.getUserPosts(user.id),
                socialAPI.getFollowers(user.id),
                socialAPI.getFollowing(user.id)
            ]);
            setPosts(postsRes.data);
            setFollowers(followersRes.data);
            setFollowing(followingRes.data);
        } catch (error) {
            console.error('Failed to fetch profile data:', error);
        } finally {
            setLoading(false);
        }
    };

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
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await usersAPI.updateMe(formData);
            await fetchUser();
            setEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!user || loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="pb-20 min-h-screen bg-[#0f0f0f] max-w-2xl mx-auto border-x border-[#ffffff05]">
            {/* Header / Cover Area */}
            <div className="relative h-[200px] md:h-[250px] bg-gradient-to-r from-indigo-900/40 via-[#1a1a1a] to-violet-900/40 border-b border-[#ffffff08]">
                {/* Overlapping Avatar */}
                <div className="absolute -bottom-16 left-6 md:left-12">
                    <div className="relative group">
                        <div
                            className={`w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full bg-[#141414] border-[6px] border-[#0f0f0f] flex items-center justify-center overflow-hidden cursor-pointer shadow-2xl relative transition-all ${uploading ? 'opacity-50' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {user.profile_picture_url ? (
                                <img src={`${API_BASE_URL}${user.profile_picture_url}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-5xl font-bold">{user.username[0].toUpperCase()}</span>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <div className={`absolute inset-0 rounded-full bg-black/50 transition-opacity flex items-center justify-center pointer-events-none border-[6px] border-transparent ${editing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <Camera className="text-white" size={32} />
                        </div>
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

            {/* Profile Info Section */}
            <div className="mt-16 md:mt-0 md:pl-[220px] px-6 pt-4 mb-2">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

                    {/* Name & Bio */}
                    <div className="flex-1 min-w-0">
                        {!editing ? (
                            <>
                                <h1 className="text-[28px] font-bold text-white leading-tight mb-1">{user.username}</h1>
                                {user.full_name && <div className="text-[16px] text-[#a3a3a3] font-medium mb-3">{user.full_name}</div>}
                                <div className="text-[15px] text-[#f5f5f5] leading-relaxed max-w-xl whitespace-pre-wrap">{user.bio || 'No bio yet.'}</div>

                                {/* Stats */}
                                <div className="flex gap-6 mt-5">
                                    <div className="flex flex-col items-center md:items-start">
                                        <span className="font-bold text-white text-[18px]">{posts.length}</span>
                                        <span className="text-[#777] text-[13px] uppercase tracking-wide font-semibold">Posts</span>
                                    </div>
                                    <div
                                        className="flex flex-col items-center md:items-start cursor-pointer group"
                                        onClick={() => setShowFollowers(true)}
                                    >
                                        <span className="font-bold text-white text-[18px] group-hover:text-indigo-400 transition-colors">{followers.length}</span>
                                        <span className="text-[#777] text-[13px] uppercase tracking-wide font-semibold group-hover:text-[#a3a3a3] transition-colors">Followers</span>
                                    </div>
                                    <div
                                        className="flex flex-col items-center md:items-start cursor-pointer group"
                                        onClick={() => setShowFollowing(true)}
                                    >
                                        <span className="font-bold text-white text-[18px] group-hover:text-indigo-400 transition-colors">{following.length}</span>
                                        <span className="text-[#777] text-[13px] uppercase tracking-wide font-semibold group-hover:text-[#a3a3a3] transition-colors">Following</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 max-w-md animate-in fade-in duration-300">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-[#555] focus:border-indigo-500 outline-none transition-colors"
                                />
                                <textarea
                                    placeholder="Bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-[#555] focus:border-indigo-500 outline-none resize-none h-28 transition-colors"
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4 md:mt-0 md:self-start md:pt-2">
                        {!editing ? (
                            <>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#ffffff08] hover:bg-[#ffffff10] text-white text-[14px] font-semibold rounded-full border border-[#ffffff08] transition-all active:scale-95"
                                >
                                    <Edit3 size={16} />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => navigate('/settings')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#ffffff08] hover:bg-[#ffffff10] text-white text-[14px] font-semibold rounded-full border border-[#ffffff08] transition-all active:scale-95"
                                >
                                    <Settings size={16} />
                                    Settings
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditing(false)}
                                    className="px-5 py-2.5 text-[#a3a3a3] hover:text-white text-[14px] font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[14px] font-semibold rounded-full shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider/Nav */}
            <div className="mt-10 border-t border-[#ffffff08] mb-8 mx-6">
                <div className="flex gap-8">
                    <button className="flex items-center gap-2 py-4 border-t-2 border-indigo-500 -mt-[1px] text-[14px] font-bold text-white transition-colors">
                        <Grid size={18} /> POSTS
                    </button>
                    {/* User requested removal of other tabs like Saved */}
                </div>
            </div>

            {/* Posts Grid */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#777]">
                        <div className="w-20 h-20 rounded-2xl bg-[#141414] border border-[#ffffff08] flex items-center justify-center mb-6">
                            <Camera size={40} strokeWidth={1} className="text-[#333]" />
                        </div>
                        <h2 className="text-[20px] font-bold text-white mb-2">No posts yet</h2>
                        <p className="text-[15px] text-[#777]">Share your moments with the world.</p>
                        <Link to="/new-post" className="mt-6 text-indigo-400 font-bold text-[14px] hover:text-indigo-300 transition-colors">Create your first post</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/post/${post.id}`}
                                className="group relative aspect-square bg-[#141414] rounded-2xl overflow-hidden border border-[#ffffff05] hover:border-[#ffffff15] transition-all hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                            >
                                {post.media_url ? (
                                    <img
                                        src={`http://127.0.0.1:8000${post.media_url}`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-8 text-center bg-gradient-to-br from-[#1a1a1a] to-[#141414]">
                                        <p className="text-[16px] text-white/80 font-medium line-clamp-4 leading-relaxed font-serif italic">"{post.content_text}"</p>
                                    </div>
                                )}

                                {/* Premium Hover Overlay */}
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-8">
                                    <div className="flex flex-col items-center gap-1 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <span className="font-bold text-xl">{post.likes_count}</span>
                                        <span className="text-xs uppercase tracking-wider opacity-70">Likes</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                        <span className="font-bold text-xl">{post.comments_count}</span>
                                        <span className="text-xs uppercase tracking-wider opacity-70">Replies</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showFollowers && (
                <UserListModal
                    title="Followers"
                    users={followers}
                    onClose={() => setShowFollowers(false)}
                />
            )}
            {showFollowing && (
                <UserListModal
                    title="Following"
                    users={following}
                    onClose={() => setShowFollowing(false)}
                />
            )}
        </div>
    );
};

export default Profile;
