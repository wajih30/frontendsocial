import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, UserPlus, UserCheck, Camera } from 'lucide-react';
import { usersAPI, socialAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const UserProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const profileResponse = await usersAPI.getUser(username);
            setProfile(profileResponse.data);

            const postsResponse = await socialAPI.getUserPosts(profileResponse.data.id);
            setPosts(postsResponse.data);

            // Note: isFollowing check could be added here if backend supports it
        } catch (error) {
            console.error('Failed to fetch profile:', error);
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
            } else {
                await socialAPI.follow(profile.id);
                setIsFollowing(true);
                setProfile(prev => ({ ...prev, followers_count: prev.followers_count + 1 }));
            }
        } catch (error) {
            console.error('Failed to toggle follow:', error);
        } finally {
            setFollowLoading(false);
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

    const isOwnProfile = user?.id === profile.id;

    return (
        <div className="min-h-screen max-w-2xl mx-auto border-x border-[#ffffff05]">
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
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#121212] flex items-center justify-center overflow-hidden border border-[#262626]">
                            {profile.profile_picture_url ? (
                                <img src={`http://127.0.0.1:8000${profile.profile_picture_url}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-white">{profile.username[0].toUpperCase()}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    {profile.bio ? (
                        <p className="text-[15px] text-[#f3f5f7] leading-relaxed whitespace-pre-wrap mb-4 antialiased">
                            {profile.bio}
                        </p>
                    ) : (
                        <p className="text-[#444] text-[15px] mb-4">No bio yet</p>
                    )}

                    <div className="flex items-center gap-4 text-[#777777] text-[14px]">
                        <span className="font-medium hover:text-white cursor-pointer transition-colors">{posts.length} posts</span>
                        <span className="font-medium hover:text-white cursor-pointer transition-colors">{profile.followers_count || 0} followers</span>
                        <span className="font-medium hover:text-white cursor-pointer transition-colors">{profile.following_count || 0} following</span>
                    </div>
                </div>

                {!isOwnProfile && (
                    <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`w-full font-bold py-2.5 rounded-2xl text-[15px] transition-all duration-300 ${isFollowing ? 'bg-transparent border border-[#262626] text-white hover:bg-[#0a0a0a]' : 'bg-white text-black hover:bg-[#e1e1e1]'}`}
                    >
                        {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}
            </div>

            {/* Profile Content Title */}
            <div className="px-6 py-4 flex items-center">
                <span className="text-[15px] font-bold text-[#f3f5f7]">Threads</span>
            </div>

            {/* Posts */}
            <div className="flex flex-col">
                {posts.length === 0 ? (
                    <div className="text-center py-24 text-[#777777] flex flex-col items-center gap-4 animate-in fade-in duration-700">
                        <div className="w-16 h-16 rounded-full border border-[#1a1a1a] flex items-center justify-center opacity-40">
                            <Camera size={28} />
                        </div>
                        <p className="font-medium">No threads yet</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={() => setPosts(posts.filter(p => p.id !== post.id))}
                            onLikeToggle={(postId, isLiked) => {
                                setPosts(posts.map(p => p.id === postId ? {
                                    ...p,
                                    is_liked_by_me: !isLiked,
                                    likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1
                                } : p));
                            }}
                        />
                    ))
                )}
            </div>

            {/* Height Spacer for Mobile */}
            <div className="h-20 sm:hidden"></div>
        </div>
    );
};


export default UserProfile;

