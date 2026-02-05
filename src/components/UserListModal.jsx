import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/client';

const UserListModal = ({ title, users, onClose }) => {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#333]">
                    <h3 className="font-bold text-white text-[16px]">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-full transition-colors">
                        <X size={20} className="text-white" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {users.length === 0 ? (
                        <div className="p-8 text-center text-[#777] text-sm">
                            No users found.
                        </div>
                    ) : (
                        <div className="py-2">
                            {users.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#252525] cursor-pointer transition-colors"
                                    onClick={() => {
                                        navigate(`/user/${user.username}`);
                                        onClose();
                                    }}
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#333] overflow-hidden flex-shrink-0 border border-[#ffffff10]">
                                        {user.profile_picture_url ? (
                                            <img src={`${API_BASE_URL}${user.profile_picture_url}`} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white text-[14px] truncate">{user.username}</div>
                                        {user.full_name && <div className="text-[#a3a3a3] text-[13px] truncate">{user.full_name}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;
