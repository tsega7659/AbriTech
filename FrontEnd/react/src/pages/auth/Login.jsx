import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        usernameOrEmail: "",
        password: ""
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Trim inputs
        const normalizedData = {
            usernameOrEmail: formData.usernameOrEmail.trim(),
            password: formData.password
        };

        const result = await login(normalizedData);

        setIsLoading(false);
        if (result.success) {
            if (result.user.role === 'parent') {
                navigate('/dashboard/parent');
            } else {
                navigate('/dashboard/student');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Sign in to your AbriTech account
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-shake">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="usernameOrEmail"
                            required
                            value={formData.usernameOrEmail}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none transition-all"
                            placeholder="Enter your username or email"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <Link to="/auth/forgot-password" university-link className="text-xs font-bold text-[#00B4D8] hover:underline">Forgot Password?</Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none transition-all"
                            placeholder="Enter your password"
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

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg bg-[#00B4D8] hover:bg-[#0096B4] shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/auth/get-started" className="font-bold text-[#00B4D8] hover:text-[#0096B4]">
                        Get Started
                    </Link>
                </p>
            </div>
        </div>
    );
}
