import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Send, MoreHorizontal, Trash2, Repeat } from 'lucide-react';
import { socialAPI, API_BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const PostCard = ({ post, onLikeToggle, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showOptions, setShowOptions] = useState(false);
    const isOwner = user?.id === post.user_id;

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            if (post.is_liked_by_me) {
                await socialAPI.unlikePost(post.id);
            } else {
                await socialAPI.likePost(post.id);
            }
            if (onLikeToggle) {
                onLikeToggle(post.id, post.is_liked_by_me);
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm('Delete this post?')) {
            try {
                await socialAPI.deletePost(post.id);
                if (onDelete) onDelete(post.id);
            } catch (error) {
                console.error('Failed to delete post:', error);
            }
        }
    };

    return (
        <div
            className="mb-6 bg-[#141414] rounded-2xl border border-[#ffffff05] shadow-lg overflow-hidden hover:border-[#ffffff10] transition-colors cursor-pointer group"
            onClick={() => navigate(`/post/${post.id}`)}
        >
            {/* Card Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#ffffff05]">
                <div className="flex items-center gap-3">
                    <div
                        onClick={(e) => { e.stopPropagation(); navigate(`/user/${post.owner.username}`); }}
                        className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#ffffff08] overflow-hidden cursor-pointer"
                    >
                        {post.owner.profile_picture_url ? (
                            <img src={`${API_BASE_URL}${post.owner.profile_picture_url}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                {post.owner.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <div
                            onClick={(e) => { e.stopPropagation(); navigate(`/user/${post.owner.username}`); }}
                            className="font-semibold text-white text-[15px] hover:text-indigo-400 transition-colors cursor-pointer leading-tight"
                        >
                            {post.owner.username}
                        </div>
                        <div className="text-[12px] text-[#777] leading-tight">{formatTime(post.created_at)}</div>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
                        className="text-[#777] hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
                    >
                        <MoreHorizontal size={18} />
                    </button>

                    {showOptions && (
                        <div className="absolute right-0 top-8 z-20 w-32 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            {isOwner ? (
                                <button onClick={handleDelete} className="w-full text-left px-4 py-2.5 text-[#ff3040] font-medium text-sm hover:bg-white/5 flex items-center gap-2">
                                    <Trash2 size={14} /> Delete
                                </button>
                            ) : (
                                <button className="w-full text-left px-4 py-2.5 text-white font-medium text-sm hover:bg-white/5">Report</button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Card Content */}
            <div className="px-4 py-3">
                <div className="text-[15px] text-[#f5f5f5] leading-normal whitespace-pre-wrap mb-3">
                    {post.content_text}
                </div>

                {post.media_url && (
                    <div className="rounded-xl overflow-hidden mb-3 border border-[#ffffff08]">
                        <img
                            src={`${API_BASE_URL}${post.media_url}`}
                            alt=""
                            className="w-full h-auto max-h-[500px] object-cover"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
            </div>

            {/* Card Footer / Actions */}
            <div className="px-4 pb-4">
                <div className="flex items-center gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 text-[14px] font-medium transition-colors ${post.is_liked_by_me
                            ? 'text-[#ff3040]'
                            : 'text-[#a3a3a3] hover:text-white'
                            }`}
                    >
                        <Heart
                            size={22}
                            className={`transition-transform duration-200 ${post.is_liked_by_me ? 'fill-current scale-110' : 'active:scale-95'}`}
                            strokeWidth={post.is_liked_by_me ? 0 : 2}
                        />
                        {post.likes_count > 0 && <span>{post.likes_count}</span>}
                    </button>

                    <button className="flex items-center gap-2 text-[#a3a3a3] hover:text-white transition-colors text-[14px] font-medium group/comment">
                        <MessageCircle size={22} className="group-active/comment:scale-95 transition-transform" />
                        {post.comments_count > 0 && <span>{post.comments_count}</span>}
                    </button>

                    <button className="ml-auto text-[#a3a3a3] hover:text-white transition-colors">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
