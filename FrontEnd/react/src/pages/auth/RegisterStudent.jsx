import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { School, User, ArrowRight, Check, Loader2, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { sanitizeFormData } from "../../utils/sanitization";

export default function RegisterStudent() {
    const [step, setStep] = useState(1);
    const [studentType, setStudentType] = useState(null); // 'enrolled' or 'finished'
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [successData, setSuccessData] = useState(null);

    // Form fields
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        gender: "",
        classLevel: "",
        schoolName: "",
        phoneNumber: "",
        parentPhone: "",
        parentEmail: "",
        courseLevel: "Beginner",
        address: "",
        educationLevel: ""
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear specific field error
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        if (apiError) setApiError("");
    };

    const validateStep = (s) => {
        const newErrors = {};
        if (s === 2) {
            if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
            else if (!/^[a-zA-Z\s\/]+$/.test(formData.fullName)) newErrors.fullName = "Name can only contain letters, spaces, and '/'";

            if (!formData.gender) newErrors.gender = "Gender is required";
            if (!formData.educationLevel) newErrors.educationLevel = "Education Level is required";

            if (studentType === 'enrolled') {
                if (!formData.schoolName.trim()) newErrors.schoolName = "School Name is required";
                if (!formData.classLevel.trim()) newErrors.classLevel = "Grade/Class is required";
                else if (!/^\d+$/.test(formData.classLevel.trim())) newErrors.classLevel = "Grade level must be a number";
            } else {
                if (!formData.address.trim()) newErrors.address = "Current Address is required";
            }

            if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
            else if (!/^09\d{8}$/.test(formData.phoneNumber.trim())) newErrors.phoneNumber = "Phone number must start with 09 and be 10 digits";
        }

        if (s === 3) {
            if (!formData.email.trim()) newErrors.email = "Email is required";
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

            if (!formData.username.trim()) newErrors.username = "Username is required";

            if (!formData.password) newErrors.password = "Password is required";
            else {
                if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
                if (!(/[a-zA-Z]/.test(formData.password) && /\d/.test(formData.password))) {
                    newErrors.password = "Password must contain both letters and numbers";
                }
            }

            if (studentType === 'enrolled') {
                if (!formData.parentEmail.trim()) newErrors.parentEmail = "Parent Email is required";
                else if (!/\S+@\S+\.\S+/.test(formData.parentEmail)) newErrors.parentEmail = "Invalid email format";

                if (!formData.parentPhone.trim()) newErrors.parentPhone = "Parent Phone is required";
                else if (!/^09\d{8}$/.test(formData.parentPhone.trim())) newErrors.parentPhone = "Parent phone must start with 09 and be 10 digits";
            }
            if (!formData.courseLevel) newErrors.courseLevel = "Course Level is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };
    const handleBack = () => {
        setErrors({});
        setApiError("");
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(3)) return;
        setIsLoading(true);
        setApiError("");

        const sanitizedData = sanitizeFormData({
            ...formData,
            isCurrentStudent: studentType === 'enrolled'
        });

        const result = await register('student', sanitizedData);

        setIsLoading(false);
        if (result.success) {
            setSuccessData(result.data);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/auth/login');
            }, 3000);
        } else {
            setApiError(result.message);
        }
    };

    if (successData) {
        return (
            <div className="text-center py-8 space-y-6">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-left">
                    <p className="text-green-800 font-medium mb-2">Welcome to AbriTech!</p>
                    <p className="text-green-700 text-sm">Your account has been created successfully. You can now sign in to access your modules.</p>
                    {successData.referralCode && (
                        <div className="space-y-2 mt-4">
                            <p className="text-sm text-green-700">Your referral code for your parent:</p>
                            <div className="bg-white border-2 border-dashed border-green-300 p-4 rounded-lg text-center">
                                <span className="text-2xl font-black text-green-600 tracking-widest">{successData.referralCode}</span>
                            </div>
                            <p className="text-xs text-green-600 italic mt-2">We've also sent this code to your parent's email.</p>
                        </div>
                    )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-700 font-medium">Redirecting to login page...</p>
                </div>
                <Link to="/auth/login" className="inline-block text-[#00B4D8] font-bold hover:underline">
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
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Student Registration</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Step {step} of 3
                </p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                    <div
                        className="h-full bg-[#00B4D8] transition-all duration-300 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                </div>
            </div>

            {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{apiError}</p>
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key="step1"
                        className="space-y-4"
                    >
                        <h3 className="font-bold text-gray-900 text-lg mb-4">I am currently...</h3>
                        <button
                            onClick={() => { setStudentType('enrolled'); handleNext(); }}
                            className="w-full flex items-center p-4 border-2 border-gray-100 rounded-xl hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all text-left group"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#00B4D8] group-hover:scale-110 transition-transform">
                                <School className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-gray-900">Enrolled in School</h4>
                                <p className="text-sm text-gray-500">I am currently attending a school.</p>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-[#00B4D8]" />
                        </button>

                        <button
                            onClick={() => { setStudentType('finished'); handleNext(); }}
                            className="w-full flex items-center p-4 border-2 border-gray-100 rounded-xl hover:border-[#FDB813] hover:bg-[#FDB813]/5 transition-all text-left group"
                        >
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-[#FDB813] group-hover:scale-110 transition-transform">
                                <User className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-gray-900">Finished / Out of School</h4>
                                <p className="text-sm text-gray-500">I have completed school or am taking a break.</p>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-[#FDB813]" />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key="step2"
                        className="space-y-4"
                    >
                        <h3 className="font-bold text-gray-900 text-lg">Personal Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.fullName ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]'}`}
                            />
                            {errors.fullName && <ErrorMessage message={errors.fullName} />}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.gender ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]'}`}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                {errors.gender && <ErrorMessage message={errors.gender} />}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                                <select
                                    name="educationLevel"
                                    value={formData.educationLevel}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.educationLevel ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]'}`}
                                >
                                    <option value="">Select Level</option>
                                    <option value="Primary">Primary</option>
                                    <option value="High School">High School</option>
                                    <option value="University">University</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.educationLevel && <ErrorMessage message={errors.educationLevel} />}
                            </div>
                        </div>

                        {studentType === 'enrolled' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                                    <input
                                        type="text"
                                        name="schoolName"
                                        value={formData.schoolName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.schoolName ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]'}`}
                                    />
                                    {errors.schoolName && <ErrorMessage message={errors.schoolName} />}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Class</label>
                                    <input
                                        type="text"
                                        name="classLevel"
                                        value={formData.classLevel}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.classLevel ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]'}`}
                                        placeholder="e.g. 10B"
                                    />
                                    {errors.classLevel && <ErrorMessage message={errors.classLevel} />}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.address ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]'}`}
                                />
                                {errors.address && <ErrorMessage message={errors.address} />}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.phoneNumber ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]'}`}
                            />
                            {errors.phoneNumber && <ErrorMessage message={errors.phoneNumber} />}
                        </div>

                        <div className="flex gap-4 mt-4">
                            <button onClick={handleBack} className="w-full py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors text-sm">Back</button>
                            <button onClick={handleNext} className="w-full bg-[#00B4D8] text-white font-bold py-2.5 rounded-xl hover:bg-[#0096B4] transition-colors shadow-lg shadow-blue-200 text-sm">Next Step</button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key="step3"
                        className="space-y-4"
                    >
                        <h3 className="font-bold text-gray-900 text-lg">Account & Security</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">Email</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 outline-none transition-all ${errors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]'}`}
                                        placeholder="email@test.com"
                                    />
                                </div>
                                {errors.email && <ErrorMessage message={errors.email} />}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 outline-none transition-all ${errors.username ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]'}`}
                                        placeholder="unique_user"
                                    />
                                </div>
                                {errors.username && <ErrorMessage message={errors.username} />}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 outline-none transition-all ${errors.password ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8]'}`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <ErrorMessage message={errors.password} />}
                        </div>

                        {studentType === 'enrolled' && (
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-3">
                                <p className="text-xs text-blue-700 font-bold">Guardian Details (for referral code)</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col">
                                        <input
                                            type="email"
                                            name="parentEmail"
                                            placeholder="Parent Email"
                                            value={formData.parentEmail}
                                            onChange={handleChange}
                                            className={`px-3 py-1.5 border rounded-lg text-xs outline-none ${errors.parentEmail ? 'border-red-300' : 'border-blue-200'}`}
                                        />
                                        {errors.parentEmail && <ErrorMessage message={errors.parentEmail} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <input
                                            type="tel"
                                            name="parentPhone"
                                            placeholder="Parent Phone"
                                            value={formData.parentPhone}
                                            onChange={handleChange}
                                            className={`px-3 py-1.5 border rounded-lg text-xs outline-none ${errors.parentPhone ? 'border-red-300' : 'border-blue-200'}`}
                                        />
                                        {errors.parentPhone && <ErrorMessage message={errors.parentPhone} />}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">Preferred Course Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, courseLevel: level });
                                            if (errors.courseLevel) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.courseLevel;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        className={`py-1.5 px-1 rounded-lg text-xs font-bold border transition-all ${formData.courseLevel === level ? 'bg-[#00B4D8] text-white border-[#00B4D8]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'} ${errors.courseLevel ? 'border-red-300' : ''}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            {errors.courseLevel && <ErrorMessage message={errors.courseLevel} />}
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button type="button" onClick={handleBack} className="w-full py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors">Back</button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#00B4D8] text-white font-semibold py-3 rounded-xl hover:bg-[#0096B4] transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isLoading ? 'Registering...' : 'Register Now'}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
