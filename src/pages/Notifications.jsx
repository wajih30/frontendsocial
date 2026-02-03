import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, AtSign, ArrowRight } from 'lucide-react';
import { notificationsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setUnreadCount } = useAuth();

    useEffect(() => {
        fetchNotifications();
        markAllAsRead();
    }, []);

    const markAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await notificationsAPI.getNotifications();
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
        return `${Math.floor(diff / 604800)}w`;
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return <div className="bg-[#ff3040] p-1 rounded-full"><Heart size={10} fill="white" className="text-white" /></div>;
            case 'comment':
                return <div className="bg-[#0095f6] p-1 rounded-full"><MessageCircle size={10} fill="white" className="text-white" /></div>;
            case 'follow':
                return <div className="bg-[#5851db] p-1 rounded-full"><UserPlus size={10} fill="white" className="text-white" /></div>;
            default:
                return <div className="bg-[#777] p-1 rounded-full"><AtSign size={10} className="text-white" /></div>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#777]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <div className="sticky top-0 z-30 bg-black/85 backdrop-blur-xl border-b border-[#ffffff15] px-4 h-[54px] flex items-center">
                <h1 className="text-[18px] font-bold text-white">Activity</h1>
            </div>

            <div className="max-w-[640px] mx-auto px-0 pt-2">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                        <div className="w-16 h-16 rounded-full border border-[#333] flex items-center justify-center mb-4 text-[#777]">
                            <Heart size={32} />
                        </div>
                        <p className="text-[#777] text-[15px]">Activity on your posts will appear here.</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="flex items-center gap-3 px-4 py-3 border-b border-[#ffffff15] hover:bg-white/[0.02] transition-colors relative"
                            >
                                <div className="relative flex-shrink-0">
                                    <Link
                                        to={`/user/${notification.sender.username}`}
                                        className="block w-10 h-10 rounded-full bg-[#1a1a1a] overflow-hidden border border-[#ffffff15]"
                                    >
                                        {notification.sender.profile_picture_url ? (
                                            <img src={`http://127.0.0.1:8000${notification.sender.profile_picture_url}`} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                                {notification.sender.username[0].toUpperCase()}
                                            </div>
                                        )}
                                    </Link>
                                    <div className="absolute -bottom-1 -right-1 border-[2px] border-black rounded-full">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 flex items-center justify-between">
                                    <div className="flex-1 mr-4">
                                        <div className="text-[14px] leading-snug">
                                            <Link to={`/user/${notification.sender.username}`} className="font-bold text-white hover:underline mr-1">
                                                {notification.sender.username}
                                            </Link>
                                            <span className="text-[#999]">
                                                {notification.type === 'like' && 'liked your post'}
                                                {notification.type === 'comment' && 'replied to your post'}
                                                {notification.type === 'follow' && 'started following you'}
                                            </span>
                                            <span className="text-[#666] ml-2 text-[13px]">{formatTime(notification.created_at)}</span>
                                        </div>
                                    </div>

                                    {notification.type === 'follow' ? (
                                        <button className="bg-white text-black px-4 py-1.5 rounded-lg text-[13px] font-bold hover:bg-[#e1e1e1] transition-colors">
                                            Follow
                                        </button>
                                    ) : notification.post_id && (
                                        <Link
                                            to={`/post/${notification.post_id}`}
                                            className="text-[#777] hover:text-white transition-colors"
                                        >
                                            <ArrowRight size={16} />
                                        </Link>
                                    )}
                                </div>

                                {!notification.is_read && (
                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-[#0095f6] rounded-full"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
