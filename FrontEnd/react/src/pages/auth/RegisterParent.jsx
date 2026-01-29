import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { sanitizeFormData } from "../../utils/sanitization";

export default function RegisterParent() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        phoneNumber: ""
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        if (apiError) setApiError("");
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
        else if (!/^[a-zA-Z\s\/]+$/.test(formData.fullName)) newErrors.fullName = "Name can only contain letters, spaces, and '/'";

        if (!formData.username.trim()) newErrors.username = "Username is required";

        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
        else if (!/^09\d{8}$/.test(formData.phoneNumber.trim())) newErrors.phoneNumber = "Phone number must start with 09 and be 10 digits";

        if (!formData.password) newErrors.password = "Password is required";
        else {
            if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
            if (!(/[a-zA-Z]/.test(formData.password) && /\d/.test(formData.password))) {
                newErrors.password = "Password must contain both letters and numbers";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setApiError("");

        const sanitizedData = sanitizeFormData(formData);
        const result = await register('parent', sanitizedData);

        setIsLoading(false);
        if (result.success) {
            setIsSuccess(true);
            // Always redirect to login after 3 seconds
            setTimeout(() => navigate('/auth/login'), 3000);
        } else {
            setApiError(result.message);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-12 space-y-4">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                    <p className="text-green-800 font-medium">Welcome to AbriTech!</p>
                    <p className="text-green-700 text-sm mt-1">Your parent account has been created. Please log in to link your child and monitor their progress.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                    <p className="text-blue-700 font-medium">Redirecting to login page...</p>
                </div>
                <Link to="/auth/login" className="inline-block text-[#00B4D8] font-bold hover:underline mt-4">
                    Go to Login Now
                </Link>
            </div>
        );
    }

    const ErrorMessage = ({ message }) => (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {message}
        </p>
    );

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Parent Registration</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Create an account to monitor your child's progress
                </p>
            </div>

            {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{apiError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all ${errors.fullName ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#FDB813]/20 focus:border-[#FDB813]'}`}
                            placeholder="Enter your full name"
                        />
                    </div>
                    {errors.fullName && <ErrorMessage message={errors.fullName} />}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all ${errors.username ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#FDB813]/20 focus:border-[#FDB813]'}`}
                            placeholder="Choose a username"
                        />
                    </div>
                    {errors.username && <ErrorMessage message={errors.username} />}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all ${errors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#FDB813]/20 focus:border-[#FDB813]'}`}
                            placeholder="Enter your email"
                        />
                    </div>
                    {errors.email && <ErrorMessage message={errors.email} />}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all ${errors.phoneNumber ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#FDB813]/20 focus:border-[#FDB813]'}`}
                            placeholder="Enter your phone"
                        />
                    </div>
                    {errors.phoneNumber && <ErrorMessage message={errors.phoneNumber} />}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 outline-none transition-all ${errors.password ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#FDB813]/20 focus:border-[#FDB813]'}`}
                            placeholder="Create a password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    {errors.password && <ErrorMessage message={errors.password} />}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#FDB813] text-white font-bold py-3.5 rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-200 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                        {isLoading ? 'Creating Account...' : 'Create Parent Account'}
                    </button>
                </div>
            </form>

            <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="font-bold text-[#00B4D8] hover:text-[#0096B4]">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
