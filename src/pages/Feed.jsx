import { useState, useEffect } from 'react';
import { socialAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        setLoading(true);
        try {
            const response = await socialAPI.getFeed();
            setPosts(response.data);
        } catch (error) {
            console.error('Failed to fetch feed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = (postId) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    if (loading && posts.length === 0) {
        return (
            <div className="flex justify-center pt-32">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="pb-24 pt-8 min-h-screen bg-[#0f0f0f]">
            <div className="max-w-[580px] mx-auto px-4">
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-[#141414] border border-[#ffffff08] flex items-center justify-center mb-6 shadow-2xl">
                            <div className="w-10 h-10 rounded-full border-2 border-[#333] border-dashed animate-[spin_10s_linear_infinite]"></div>
                        </div>
                        <h2 className="text-[24px] font-bold text-white mb-3">Your Feed is Quiet</h2>
                        <p className="text-[#a3a3a3] text-[15px] mb-8 max-w-xs leading-relaxed">
                            It looks like you're not following anyone yet. Discover amazing creators to fill this space.
                        </p>
                        <Link
                            to="/search"
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold px-8 py-3 rounded-full shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_25px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 transition-all text-[15px]"
                        >
                            Explore Creators
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onDelete={handleDeletePost}
                                onLikeToggle={(postId, isLiked) => {
                                    setPosts(posts.map(p => p.id === postId ? {
                                        ...p,
                                        is_liked_by_me: !isLiked,
                                        likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1
                                    } : p));
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
