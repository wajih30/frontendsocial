import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, UserPlus, UserCheck, Camera, Loader2 } from 'lucide-react';
import { usersAPI, socialAPI, uploadAPI, API_BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import UserListModal from '../components/UserListModal';

const UserProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);

    // Social lists state
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioInput, setBioInput] = useState('');
    const [bioLoading, setBioLoading] = useState(false);
    const { user, fetchUser: fetchCurrentUser } = useAuth();
    const fileInputRef = useRef(null);
    const isOwnProfile = user?.id === profile?.id;

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const profileResponse = await usersAPI.getUser(username);
            setProfile(profileResponse.data);
            const userId = profileResponse.data.id;

            // Fetch posts and social lists concurrently
            const [postsRes, followersRes, followingRes] = await Promise.all([
                socialAPI.getUserPosts(userId),
                socialAPI.getFollowers(userId),
                socialAPI.getFollowing(userId)
            ]);

            setPosts(postsRes.data);
            setFollowers(followersRes.data);
            setFollowing(followingRes.data);
            setBioInput(profileResponse.data.bio || '');

            // Check if current user is following this profile
            if (user && followersRes.data.some(f => f.id === user.id)) {
                setIsFollowing(true);
            } else {
                setIsFollowing(false);
            }

        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setError(error.response?.data?.detail || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!profile) return;
        setFollowLoading(true);

        try {
            if (isFollowing) {
                await socialAPI.unfollow(profile.id);
                setIsFollowing(false);
                setProfile(prev => ({ ...prev, followers_count: prev.followers_count - 1 }));
                // Remove self from followers list locally
                setFollowers(prev => prev.filter(f => f.id !== user.id));
            } else {
                await socialAPI.follow(profile.id);
                setIsFollowing(true);
                setProfile(prev => ({ ...prev, followers_count: prev.followers_count + 1 }));
                // Add self to followers list locally (mock)
                setFollowers(prev => [...prev, { ...user }]);
            }
        } catch (error) {
            console.error('Failed to toggle follow:', error);
            setError(error.response?.data?.detail || 'Action failed. Please try again.');
            // Revert state on actual error
            if (!isFollowing) {
                // Was trying to follow but failed
                setIsFollowing(false);
                setProfile(prev => ({ ...prev, followers_count: prev.followers_count - 1 }));
                setFollowers(prev => prev.filter(f => f.id !== user.id));
            } else {
                // Was trying to unfollow but failed
                setIsFollowing(true);
                setProfile(prev => ({ ...prev, followers_count: prev.followers_count + 1 }));
                setFollowers(prev => [...prev, { ...user }]);
            }
        } finally {
            setFollowLoading(false);
        }
    };

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const uploadResponse = await uploadAPI.uploadFile(file);
            await usersAPI.updateMe({ profile_picture_url: uploadResponse.data.url });
            await fetchCurrentUser();
            // Also refresh local profile state if it's our own
            if (isOwnProfile) {
                setProfile(prev => ({ ...prev, profile_picture_url: uploadResponse.data.url }));
            }
        } catch (error) {
            console.error('Failed to update profile picture:', error);
            setError(error.response?.data?.detail || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleBioUpdate = async () => {
        setBioLoading(true);
        setError(null);
        try {
            await usersAPI.updateMe({ bio: bioInput.trim() });
            await fetchCurrentUser();
            setProfile(prev => ({ ...prev, bio: bioInput.trim() }));
            setIsEditingBio(false);
        } catch (error) {
            console.error('Failed to update bio:', error);
            setError(error.response?.data?.detail || 'Failed to update bio');
        } finally {
            setBioLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <h2 className="text-[20px] font-bold mb-4 text-[#f3f5f7]">User not found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-[#777777] hover:text-white font-medium transition-colors"
                >
                    Back to feed
                </button>
            </div>
        );
    }



    return (
        <div className="min-h-screen max-w-2xl mx-auto border-x border-[#ffffff05]">
            {error && (
                <div className="mx-6 mt-4 bg-[#ff3040]/10 text-[#ff3040] px-4 py-3 rounded-xl text-sm font-medium border border-[#ff3040]/20 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff3040]"></span>
                        {error}
                    </div>
                    <button onClick={() => setError(null)} className="text-[#ff3040] hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}
            {/* Profile Header */}
            <div className="px-6 pt-10 pb-6 border-b border-[#1a1a1a]">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-[24px] sm:text-[28px] font-bold text-[#f3f5f7] mb-1 leading-tight truncate">
                            {profile.full_name || profile.username}
                        </h1>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[15px] font-medium text-[#f3f5f7]">{profile.username}</span>
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        <div className="relative group">
                            <div
                                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#121212] flex items-center justify-center overflow-hidden border border-[#262626] relative transition-opacity ${uploading ? 'opacity-50' : ''} ${isOwnProfile ? 'cursor-pointer' : ''}`}
                                onClick={() => isOwnProfile && fileInputRef.current?.click()}
                            >
                                {profile.profile_picture_url ? (
                                    <img src={`${API_BASE_URL}${profile.profile_picture_url}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white">{profile.username[0].toUpperCase()}</span>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Loader2 className="text-white animate-spin" size={24} />
                                    </div>
                                )}
                            </div>

                            {isOwnProfile && !uploading && (
                                <div
                                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
                                >
                                    <Camera className="text-white" size={24} />
                                </div>
                            )}

                            {isOwnProfile && (
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    className="hidden"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    {isOwnProfile && isEditingBio ? (
                        <div className="mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                            <textarea
                                value={bioInput}
                                onChange={(e) => setBioInput(e.target.value)}
                                className="w-full bg-[#121212] border border-[#262626] rounded-xl px-4 py-3 text-[#f3f5f7] outline-none focus:border-[#444] transition-all duration-300 placeholder-[#333] min-h-[100px] resize-none text-[15px]"
                                placeholder="Write a bio..."
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={() => {
                                        setIsEditingBio(false);
                                        setBioInput(profile.bio || '');
                                    }}
                                    className="px-4 py-1.5 text-[13px] font-bold text-[#777] hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBioUpdate}
                                    disabled={bioLoading}
                                    className="px-6 py-1.5 bg-white text-black text-[13px] font-bold rounded-xl hover:bg-[#e1e1e1] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {bioLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="group relative">
                            {profile.bio ? (
                                <p className="text-[15px] text-[#f3f5f7] leading-relaxed whitespace-pre-wrap mb-4 antialiased">
                                    {profile.bio}
                                </p>
                            ) : (
                                <p className="text-[#444] text-[15px] mb-4">No bio yet</p>
                            )}
                            {isOwnProfile && (
                                <button
                                    onClick={() => setIsEditingBio(true)}
                                    className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-[#777] hover:text-white"
                                >
                                    <span className="text-[12px] font-bold underline">Edit</span>
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-[#777777] text-[14px]">
                        <span className="font-medium hover:text-white cursor-pointer transition-colors">{posts.length} posts</span>
                        <span
                            className="font-medium hover:text-white cursor-pointer transition-colors"
                            onClick={() => setShowFollowers(true)}
                        >
                            {followers.length} followers
                        </span>
                        <span
                            className="font-medium hover:text-white cursor-pointer transition-colors"
                            onClick={() => setShowFollowing(true)}
                        >
                            {following.length} following
                        </span>
                    </div>
                </div>

                {/* Follow Button */}
                {!isOwnProfile ? (
                    <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`w-full font-bold py-2.5 rounded-2xl text-[15px] transition-all duration-300 ${isFollowing ? 'bg-transparent border border-[#262626] text-white hover:bg-[#0a0a0a]' : 'bg-white text-black hover:bg-[#e1e1e1]'}`}
                    >
                        {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/settings')}
                        className="w-full font-bold py-2.5 rounded-2xl text-[15px] bg-[#262626] text-white hover:bg-[#333] transition-colors"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Profile Content Title */}
            <div className="px-6 py-4 flex items-center">
                <span className="text-[15px] font-bold text-[#f3f5f7]">Threads</span>
            </div>

            {/* Posts */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#777]">
                        <div className="w-20 h-20 rounded-2xl bg-[#141414] border border-[#ffffff08] flex items-center justify-center mb-6">
                            <Camera size={40} strokeWidth={1} className="text-[#333]" />
                        </div>
                        <h2 className="text-[20px] font-bold text-white mb-2">No posts yet</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="group relative aspect-square bg-[#141414] rounded-2xl overflow-hidden border border-[#ffffff05] hover:border-[#ffffff15] transition-all hover:-translate-y-1 shadow-lg hover:shadow-2xl cursor-pointer"
                                onClick={() => navigate(`/post/${post.id}`)}
                            >
                                {post.media_url ? (
                                    <img
                                        src={`${API_BASE_URL}${post.media_url}`}
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
                            </div>
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

            {/* Height Spacer for Mobile */}
            <div className="h-20 sm:hidden"></div>
        </div>
    );
};

export default UserProfile;

