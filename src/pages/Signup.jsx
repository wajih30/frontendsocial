import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await authAPI.register({
                username: formData.username.trim(),
                email: formData.email.trim(),
                full_name: formData.full_name,
                password: formData.password,
            });

            // Navigate to OTP verification
            navigate('/verify', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <div className="w-full max-w-[350px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">

                {/* Main Card */}
                <div className="w-full border border-[#ffffff15] rounded-xl p-6 md:p-8 bg-[#0a0a0a]">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black mb-4">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" /></svg>
                        </div>
                        <h2 className="font-bold text-[#f3f5f7] text-[16px] text-center leading-snug mb-2">Sign up to see photos and videos from your friends.</h2>
                    </div>

                    {error && (
                        <div className="mb-4 bg-[#ff3040]/10 border border-[#ff3040]/20 text-[#ff3040] py-2.5 px-3 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-[#1a1a1a] border border-[#333] text-white text-[13px] rounded-[5px] px-3 py-2 outline-none focus:border-[#777] transition-colors placeholder-[#777]"
                        />
                        <input
                            type="text"
                            name="full_name"
                            placeholder="Full Name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="bg-[#1a1a1a] border border-[#333] text-white text-[13px] rounded-[5px] px-3 py-2 outline-none focus:border-[#777] transition-colors placeholder-[#777]"
                        />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="bg-[#1a1a1a] border border-[#333] text-white text-[13px] rounded-[5px] px-3 py-2 outline-none focus:border-[#777] transition-colors placeholder-[#777]"
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="bg-[#1a1a1a] border border-[#333] text-white text-[13px] rounded-[5px] px-3 py-2 outline-none focus:border-[#777] transition-colors placeholder-[#777]"
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="bg-[#1a1a1a] border border-[#333] text-white text-[13px] rounded-[5px] px-3 py-2 outline-none focus:border-[#777] transition-colors placeholder-[#777]"
                        />

                        <p className="text-[11px] text-[#777] text-center my-2 leading-tight">
                            By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
                        </p>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold text-[14px] py-1.5 rounded-[8px] transition-all disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? 'Signing up...' : 'Sign up'}
                        </button>
                    </form>
                </div>

                {/* Login Link */}
                <div className="w-full border border-[#ffffff15] rounded-xl p-5 bg-[#0a0a0a] mt-3 text-center">
                    <span className="text-[14px] text-white">Have an account? </span>
                    <Link to="/login" className="text-[#0095f6] font-bold text-[14px] hover:text-[#0095f6]/80">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
