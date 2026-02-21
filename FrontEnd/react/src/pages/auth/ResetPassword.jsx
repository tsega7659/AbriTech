import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, KeyRound, AlertCircle, CheckCircle } from "lucide-react";
import apiClient from "../../lib/apiClient";

export default function ResetPassword() {
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/auth/forgot-password');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError("");

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedOtp = otp.trim();

        try {
            await apiClient.post('/auth/reset-password', {
                email: normalizedEmail,
                otp: normalizedOtp,
                newPassword: password
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/auth/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) return null;

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Enter the OTP sent to <strong>{email}</strong> and your new password.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-shake">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">Password reset successfully! Redirecting to login...</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none transition-all tracking-widest font-mono text-lg"
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none transition-all"
                            placeholder="Min 8 chars, letters & numbers"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none transition-all"
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full bg-[#00B4D8] hover:bg-[#0096B4] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Resetting...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center mt-6">
                <button
                    onClick={() => navigate('/auth/forgot-password')}
                    type="button"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Resend OTP?
                </button>
            </div>
        </div>
    );
}
