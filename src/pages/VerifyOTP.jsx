import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/client';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) {
            navigate('/signup');
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newOtp = [...otp];

        for (let i = 0; i < pastedData.length; i++) {
            if (/\d/.test(pastedData[i])) {
                newOtp[i] = pastedData[i];
            }
        }

        setOtp(newOtp);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await authAPI.verifyOTP(email, otpString);
            setSuccess('Email verified successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <div className="w-full max-w-[350px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">

                {/* Logo Area */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-[18px] flex items-center justify-center text-black mb-4 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                        <ShieldCheck size={36} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-white text-[20px] font-bold">Verify Your Email</h1>
                </div>

                {/* Main Card */}
                <div className="w-full border border-[#ffffff15] rounded-xl p-6 md:p-8 bg-[#0a0a0a]">
                    {error && (
                        <div className="mb-4 bg-[#ff3040]/10 border border-[#ff3040]/20 text-[#ff3040] py-2.5 px-3 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-500 py-2.5 px-3 rounded-lg text-sm text-center font-medium">
                            {success}
                        </div>
                    )}

                    <p className="text-center text-[#777] text-[14px] mb-6">
                        Enter the 6-digit code we sent to<br />
                        <strong className="text-white">{email}</strong>
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex justify-center gap-2" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-11 h-12 bg-[#1a1a1a] border border-[#333] text-white text-[20px] font-bold rounded-lg text-center outline-none focus:border-[#0095f6] focus:ring-1 focus:ring-[#0095f6]/30 transition-all"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold text-[14px] py-2 rounded-[8px] transition-all disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="h-[1px] bg-[#333] flex-1"></div>
                        <span className="text-[#777] text-[12px] font-bold uppercase">OR</span>
                        <div className="h-[1px] bg-[#333] flex-1"></div>
                    </div>

                    <div className="text-center">
                        <Link to="/signup" className="text-[12px] text-white hover:text-[#ccc] transition-colors flex items-center justify-center gap-1">
                            <ArrowLeft size={14} />
                            Back to signup
                        </Link>
                    </div>
                </div>

                {/* Login Link */}
                <div className="w-full border border-[#ffffff15] rounded-xl p-5 bg-[#0a0a0a] mt-3 text-center">
                    <span className="text-[14px] text-white">Already have an account? </span>
                    <Link to="/login" className="text-[#0095f6] font-bold text-[14px] hover:text-[#0095f6]/80">
                        Log in
                    </Link>
                </div>

                <div className="mt-6 text-center text-[#555] text-[12px]">
                    <p>&copy; 2026 Social from Meta</p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
