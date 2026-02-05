import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(username.trim(), password);
            login(response.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <div className="w-full max-w-[350px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">

                {/* Logo Area */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-[18px] flex items-center justify-center text-black mb-6 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" /></svg>
                    </div>
                </div>

                {/* Main Card */}
                <div className="w-full border border-[#ffffff15] rounded-xl p-6 md:p-8 bg-[#0a0a0a]">
                    {error && (
                        <div className="mb-4 bg-[#ff3040]/10 border border-[#ff3040]/20 text-[#ff3040] py-2.5 px-3 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Email or mobile number"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="bg-[#1a1a1a] border border-[#333] text-white text-[14px] rounded-[5px] px-4 py-2.5 outline-none focus:border-[#777] transition-colors placeholder-[#777]"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-[#1a1a1a] border border-[#333] text-white text-[14px] rounded-[5px] px-4 py-2.5 outline-none focus:border-[#777] transition-colors placeholder-[#777]"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold text-[14px] py-1.5 rounded-[8px] transition-all disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="h-[1px] bg-[#333] flex-1"></div>
                        <span className="text-[#777] text-[12px] font-bold uppercase">OR</span>
                        <div className="h-[1px] bg-[#333] flex-1"></div>
                    </div>

                    <div className="text-center">
                        <Link to="/forgot-password" className="text-[12px] text-white hover:text-[#ccc] transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                {/* Signup Link */}
                <div className="w-full border border-[#ffffff15] rounded-xl p-5 bg-[#0a0a0a] mt-3 text-center">
                    <span className="text-[14px] text-white">Don't have an account? </span>
                    <Link to="/signup" className="text-[#0095f6] font-bold text-[14px] hover:text-[#0095f6]/80">
                        Sign up
                    </Link>
                </div>

                <div className="mt-6 text-center text-[#555] text-[12px]">
                    <p>&copy; 2026 Social from Meta</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
