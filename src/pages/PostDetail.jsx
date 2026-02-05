import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { socialAPI, API_BASE_URL } from '../api/client';
import PostCard from '../components/PostCard';
import { ArrowLeft, Send, Trash2, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await socialAPI.getPost(id);
            setPost(response.data);
        } catch (error) {
            console.error('Failed to fetch post:', error);
            setError('Post not found or network error');
        } finally {
            setLoading(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            const response = await socialAPI.createComment(post.id, commentText);
            setPost(curr => ({
                ...curr,
                comments: [response.data, ...curr.comments],
                comments_count: curr.comments_count + 1
            }));
            setCommentText('');
        } catch (error) {
            console.error('Failed to add comment:', error);
            setError(error.response?.data?.detail || 'Failed to add reply');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this reply?')) return;
        try {
            await socialAPI.deleteComment(commentId);
            setPost(curr => ({
                ...curr,
                comments: curr.comments.filter(c => c.id !== commentId),
                comments_count: curr.comments_count - 1
            }));
        } catch (error) {
            console.error('Failed to delete comment:', error);
            setError(error.response?.data?.detail || 'Failed to delete reply');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#777]"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-20 text-[#777]">
                Thread not found
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 max-w-2xl mx-auto border-x border-[#ffffff05]">
            {error && (
                <div className="mx-4 mt-4 mb-2 bg-[#ff3040]/10 text-[#ff3040] px-4 py-3 rounded-xl text-sm font-medium border border-[#ff3040]/20 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff3040]"></span>
                        {error}
                    </div>
                    <button onClick={() => setError(null)} className="text-[#ff3040] hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}
            {/* Header */}
            <div className="sticky top-0 z-30 bg-black/85 backdrop-blur-xl border-b border-[#ffffff15] px-4 h-[54px] flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} color="white" />
                </button>
                <h1 className="text-[18px] font-bold text-white">Thread</h1>
            </div>

            {/* Main Post - Reusing PostCard for consistency */}
            <div>
                <PostCard
                    post={post}
                    onLikeToggle={(postId, isLiked) => {
                        setPost(curr => ({
                            ...curr,
                            is_liked_by_me: !isLiked,
                            likes_count: isLiked ? curr.likes_count - 1 : curr.likes_count + 1
                        }));
                    }}
                    onDelete={() => navigate('/')}
                />
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-[#ffffff10] mx-4"></div>

            {/* Reply Input (Inline-ish) */}
            <div className="px-4 py-4 flex gap-3 border-b border-[#ffffff10]">
                <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#ffffff15] overflow-hidden flex-shrink-0">
                    {currentUser?.profile_picture_url ? (
                        <img src={`${API_BASE_URL}${currentUser.profile_picture_url}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                            {currentUser?.username[0].toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <form onSubmit={handleCommentSubmit}>
                        <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={`Reply to ${post.owner.username}...`}
                            className="w-full bg-transparent text-white placeholder-[#777] outline-none text-[15px] pt-2 pb-2"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={!commentText.trim() || submitting}
                                className="text-[#0095f6] font-bold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed hover:text-[#1877f2] transition-colors"
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Comments List */}
            <div className="flex flex-col">
                {post.comments?.map((comment) => (
                    <div
                        key={comment.id}
                        className="flex gap-3 px-4 py-3 border-b border-[#ffffff08] hover:bg-white/[0.01]"
                    >
                        <div
                            onClick={() => navigate(`/user/${comment.user.username}`)}
                            className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#ffffff15] overflow-hidden cursor-pointer flex-shrink-0"
                        >
                            {comment.user.profile_picture_url ? (
                                <img src={`${API_BASE_URL}${comment.user.profile_picture_url}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                    {comment.user.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="font-bold text-[15px] text-white hover:underline cursor-pointer"
                                        onClick={() => navigate(`/user/${comment.user.username}`)}
                                    >
                                        {comment.user.username}
                                    </span>
                                    <span className="text-[#616161] text-[13px]">{new Date(comment.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                </div>

                                {(currentUser?.id === comment.user_id || currentUser?.id === post.user_id) && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-[#616161] hover:text-[#ff3040] p-1 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="text-[15px] text-[#f3f5f7] leading-tight whitespace-pre-wrap">
                                {comment.comment_text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostDetail;
