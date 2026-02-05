import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, X, ChevronLeft, UploadCloud } from 'lucide-react';
import { socialAPI, uploadAPI, API_BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';

const NewPost = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const MAX_CHARS = 280;

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!caption.trim() && !file) {
            setError('Please add a photo or some text.');
            return;
        }

        setLoading(true);

        try {
            let mediaUrl = null;

            if (file) {
                const uploadResponse = await uploadAPI.uploadFile(file);
                mediaUrl = uploadResponse.data.url;
            }

            const postData = {
                content_text: caption,
                media_url: mediaUrl,
            };

            await socialAPI.createPost(postData);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
            {/* Modal Container */}
            <div className="w-full max-w-[600px] bg-[#141414] border border-[#ffffff08] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="h-[60px] border-b border-[#ffffff08] flex items-center justify-between px-6 bg-[#1a1a1a]">
                    <span className="font-bold text-[18px] text-white tracking-tight">Create Post</span>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[#777] hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    {error && (
                        <div className="bg-[#ff3040]/10 text-[#ff3040] px-4 py-3 rounded-xl mb-4 text-sm font-medium border border-[#ff3040]/20 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3040]"></span>
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 mb-6">
                        <div className="flex-shrink-0">
                            <div className="w-11 h-11 rounded-full bg-[#1a1a1a] border border-[#ffffff08] overflow-hidden">
                                {user?.profile_picture_url ? (
                                    <img src={`${API_BASE_URL}${user?.profile_picture_url}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                        {user?.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <textarea
                                placeholder="What's happening?"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value.slice(0, MAX_CHARS))}
                                className="w-full bg-transparent text-white text-[18px] placeholder-[#555] outline-none resize-none min-h-[120px] font-normal leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Media Preview / Dropzone */}
                    <div className="mb-6">
                        {preview ? (
                            <div className="relative rounded-xl overflow-hidden bg-black border border-[#ffffff08] group">
                                <img src={preview} alt="Preview" className="w-full h-auto max-h-[400px] object-contain bg-black" />
                                <button
                                    onClick={handleRemoveFile}
                                    className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-full text-white/90 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-[100px] rounded-xl border-2 border-dashed border-[#ffffff10] flex flex-col items-center justify-center cursor-pointer hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all text-[#777] hover:text-[#6366f1] gap-2 group"
                            >
                                <UploadCloud size={28} className="text-[#555] group-hover:text-[#6366f1] transition-colors" />
                                <span className="text-[14px] font-medium">Add photos or videos</span>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Footer / Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#ffffff08]">
                        <div className="flex items-center gap-4">
                            <span className={`text-[12px] font-medium transition-colors ${caption.length > MAX_CHARS * 0.9 ? 'text-[#ff3040]' : 'text-[#555]'}`}>
                                {caption.length}/{MAX_CHARS}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-5 py-2 text-[#a3a3a3] hover:text-white text-[14px] font-semibold transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || (!caption.trim() && !file)}
                                className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-8 py-2 rounded-full font-bold text-[14px] shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-95"
                            >
                                {loading ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewPost;
