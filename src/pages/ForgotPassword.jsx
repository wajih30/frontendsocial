import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import { ArrowLeft, Mail, KeyRound, Lock } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.forgotPassword(email.trim());
            setSuccess('A reset code has been sent to your email.');
            setTimeout(() => {
                setSuccess('');
                setStep(2);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setSuccess('Code verified! Please set your new password.');
        setTimeout(() => {
            setSuccess('');
            setStep(3);
        }, 1000);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            await authAPI.resetPassword(email.trim(), otp.trim(), newPassword);
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const getStepIcon = () => {
        if (step === 1) return <Mail size={36} strokeWidth={1.5} />;
        if (step === 2) return <KeyRound size={36} strokeWidth={1.5} />;
        return <Lock size={36} strokeWidth={1.5} />;
    };

    const getStepTitle = () => {
        if (step === 1) return 'Reset Password';
        if (step === 2) return 'Verify Code';
        return 'Create New Password';
    };

    const getStepDescription = () => {
        if (step === 1) return "Enter your email address and we'll send you a code to reset your password.";
        if (step === 2) return <>Enter the 6-digit code sent to<br /><strong className="text-white">{email}</strong></>;
        return 'Create a strong password for your account.';
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <div className="w-full max-w-[350px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">

                {/* Logo Area */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-[18px] flex items-center justify-center text-black mb-4 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                        {getStepIcon()}
                    </div>
                    <h1 className="text-white text-[20px] font-bold">{getStepTitle()}</h1>
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
                        {getStepDescription()}
                    </p>

                    {/* Step 1: Email Input */}
                    {step === 1 && (
                        <form onSubmit={handleRequestOTP} className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-[#1a1a1a] border border-[#333] text-white text-[14px] rounded-[5px] px-4 py-2.5 outline-none focus:border-[#777] transition-colors placeholder-[#777]"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold text-[14px] py-2 rounded-[8px] transition-all disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength="6"
                                className="bg-[#1a1a1a] border border-[#333] text-white text-[20px] rounded-[5px] px-4 py-3 outline-none focus:border-[#777] transition-colors placeholder-[#777] text-center tracking-[8px] font-mono"
                            />
                            <button
                                type="submit"
                                className="mt-2 bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold text-[14px] py-2 rounded-[8px] transition-all active:scale-[0.98]"
                            >
                                Verify Code
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-[#777] text-[13px] hover:text-white transition-colors mt-1"
                            >
                                ← Change email
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
                            <input
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="bg-[#1a1a1a] border border-[#333] text-white text-[14px] rounded-[5px] px-4 py-2.5 outline-none focus:border-[#777] transition-colors placeholder-[#777]"
                            />
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-[#1a1a1a] border border-[#333] text-white text-[14px] rounded-[5px] px-4 py-2.5 outline-none focus:border-[#777] transition-colors placeholder-[#777]"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold text-[14px] py-2 rounded-[8px] transition-all disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <div className="flex items-center gap-4 my-6">
                        <div className="h-[1px] bg-[#333] flex-1"></div>
                        <span className="text-[#777] text-[12px] font-bold uppercase">OR</span>
                        <div className="h-[1px] bg-[#333] flex-1"></div>
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="text-[12px] text-white hover:text-[#ccc] transition-colors flex items-center justify-center gap-1">
                            <ArrowLeft size={14} />
                            Back to login
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

export default ForgotPassword;
