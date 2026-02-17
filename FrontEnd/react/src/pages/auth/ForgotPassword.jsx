import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const normalizedEmail = email.trim().toLowerCase();

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizedEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/auth/reset-password', { state: { email } });
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Enter your email address to receive a password reset OTP.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-shake">
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">OTP sent successfully! Redirecting...</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none transition-all"
                            placeholder="Enter your email"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || success}
                    className="w-full bg-[#00B4D8] hover:bg-[#0096B4] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" /> Sending OTP...
                        </>
                    ) : (
                        "Send OTP"
                    )}
                </button>
            </form>

            <div className="text-center mt-6">
                <Link to="/auth/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
