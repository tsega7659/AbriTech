import React, { useState } from 'react';
import {
    UserPlus,
    Mail,
    Lock,
    User,
    Shield,
    GraduationCap,
    Users2,
    CheckCircle2,
    AlertCircle,
    Check,
    XCircle,
    ArrowRight,
    BookOpen,
    Phone,
    MapPin,
    School,
    Layers,
    Copy,
    Eye,
    EyeOff
} from 'lucide-react';
import {
    useRegisterStudent,
    useRegisterTeacher,
    useRegisterAdmin,
    useRegisterParent,
    useAdminCourses
} from '../../hooks/useAdminQueries';
import Loading from '../../components/Loading';
import FeedbackModal from '../../components/FeedbackModal';

const UserRegistration = () => {
    const registerStudentMutation = useRegisterStudent();
    const registerTeacherMutation = useRegisterTeacher();
    const registerAdminMutation = useRegisterAdmin();
    const registerParentMutation = useRegisterParent();
    const { data: courses = [] } = useAdminCourses();

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'student',
        // Optional fields based on role
        gender: 'Male',
        phoneNumber: '',
        address: '',
        // Student specific
        schoolName: '',
        educationLevel: 'Primary',
        classLevel: '',
        courseLevel: 'beginner',
        isCurrentStudent: false,
        parentEmail: '',
        parentPhone: '',
        // Teacher specific
        specialization: '',
        courseIds: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const roles = [
        { id: 'admin', label: 'Administrator', icon: Shield, desc: 'Full platform access' },
        { id: 'teacher', label: 'Instructor', icon: BookOpen, desc: 'Manage courses & students' },
        { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Access learning content' },
        { id: 'parent', label: 'Parent', icon: Users2, desc: 'Monitor student progress' },
    ];

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessData(null);

        try {
            let data;
            let submitData = formData;

            // Convert courseIds to numbers for teacher registration
            if (formData.role === 'teacher') {
                submitData = {
                    ...formData,
                    courseIds: formData.courseIds.map(id => Number(id))
                };
            }

            if (formData.role === 'student') {
                data = await registerStudentMutation.mutateAsync(submitData);
            } else if (formData.role === 'teacher') {
                data = await registerTeacherMutation.mutateAsync(submitData);
            } else if (formData.role === 'admin') {
                data = await registerAdminMutation.mutateAsync(submitData);
            } else if (formData.role === 'parent') {
                data = await registerParentMutation.mutateAsync(submitData);
            }

            setSuccessData(data);
            if (formData.role !== 'teacher') {
                setFormData({
                    ...formData,
                    fullName: '',
                    username: '',
                    email: '',
                    password: '',
                    phoneNumber: '',
                    address: '',
                    schoolName: '',
                    classLevel: '',
                    courseLevel: 'beginner',
                    isCurrentStudent: false,
                    parentEmail: '',
                    parentPhone: '',
                    specialization: '',
                    courseIds: []
                });
            }
        } catch (error) {
            showFeedback("Registration Failed", error.response?.data?.message || 'Registration failed', "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCourseToggle = (courseId) => {
        setFormData(prev => ({
            ...prev,
            courseIds: prev.courseIds.includes(courseId)
                ? prev.courseIds.filter(id => id !== courseId)
                : [...prev.courseIds, courseId]
        }));
    };

    return (
        <div className="p-4 md:p-6 lg:p-10 max-w-6xl mx-auto space-y-8 font-sans">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Register New User</h1>
                <p className="text-slate-500 font-bold">Create accounts for platform members and assign appropriate roles.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[600px]">
                    {/* Role Selection Sidebar */}
                    <div className="lg:col-span-2 bg-slate-50/50 p-6 md:p-8 border-r border-slate-100 space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select User Role</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, role: role.id });
                                        setSuccessData(null);
                                    }}
                                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex gap-4 items-center ${formData.role === role.id
                                        ? 'bg-white border-primary shadow-lg shadow-primary/10'
                                        : 'bg-transparent border-transparent hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${formData.role === role.id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'
                                        }`}>
                                        <role.icon className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`font-black tracking-tight truncate ${formData.role === role.id ? 'text-slate-800' : 'text-slate-500'}`}>{role.label}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{role.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm mt-8">
                            <div className="flex gap-3 text-slate-400">
                                <AlertCircle className="w-5 h-5 shrink-0 text-primary" />
                                <p className="text-[11px] font-bold leading-relaxed">
                                    Roles determine platform access permissions. Ensure correct role is selected before proceeding.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div className="lg:col-span-3 p-6 md:p-10 space-y-8 relative">
                        {successData && (
                            <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-[2rem] animate-in fade-in zoom-in duration-300">
                                <div className="flex items-center gap-3 text-green-700 mb-4">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <span className="font-black tracking-tight">Registration Successful!</span>
                                </div>

                                {/* Credentials Section */}
                                {(formData.role === 'teacher' || formData.role === 'admin') && successData.username && (
                                    <div className="space-y-4 bg-white p-5 rounded-2xl border border-green-200 shadow-sm mb-4">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Login Credentials</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Username</p>
                                                <p className="font-black text-slate-800">{successData.username}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{formData.role === 'teacher' ? 'Generated' : ''} Password</p>
                                                <p className="font-black text-primary font-mono select-all">{successData.password || 'Sent to Email'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(`User: ${successData.username}\nPass: ${successData.password}`)}
                                            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all flex items-center justify-center gap-2"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Copied to Clipboard' : 'Copy Credentials'}
                                        </button>
                                    </div>
                                )}

                                {/* Referral Code for Students */}
                                {formData.role === 'student' && successData.referralCode && (
                                    <div className="space-y-4 bg-white p-5 rounded-2xl border border-green-200 shadow-sm mb-4">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Parental Linkage Code</p>
                                        <div className="bg-slate-50 p-4 rounded-xl">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Referral Code</p>
                                            <p className="font-black text-primary font-mono text-lg select-all">{successData.referralCode}</p>
                                            <p className="text-[10px] text-slate-500 mt-2">Share this code with the student's parent for account linkage</p>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(successData.referralCode)}
                                            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all flex items-center justify-center gap-2"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Copied to Clipboard' : 'Copy Code'}
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSuccessData(null)}
                                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Register Another User
                                </button>
                            </div>
                        )}

                        {!successData && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Common Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                                placeholder="Abebe Kebede"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    {(formData.role === 'student' || formData.role === 'admin' || formData.role === 'parent') && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Username {(formData.role === 'admin' || formData.role === 'parent') && <span className="text-slate-300">(Auto-generated if empty)</span>}</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    required={formData.role === 'student'}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}


                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                                placeholder="user@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {formData.role !== 'teacher' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}


                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phone Number</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="tel"
                                                required
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                                placeholder="09XXXXXXXX"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Role-Specific Fields */}
                                {formData.role === 'student' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">School Name</label>
                                            <div className="relative group">
                                                <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                                    placeholder="e.g. Tikur Anbessa"
                                                    value={formData.schoolName}
                                                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Education Level</label>
                                            <div className="relative group">
                                                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <select
                                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl appearance-none font-bold text-slate-700"
                                                    value={formData.educationLevel}
                                                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                                                >
                                                    <option value="Primary">Primary</option>
                                                    <option value="Secondary">Secondary</option>
                                                    <option value="University">University</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Course Level</label>
                                            <div className="relative group">
                                                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <select
                                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl appearance-none font-bold text-slate-700"
                                                    value={formData.courseLevel}
                                                    onChange={(e) => setFormData({ ...formData, courseLevel: e.target.value })}
                                                >
                                                    <option value="beginner">Beginner</option>
                                                    <option value="intermediate">Intermediate</option>
                                                    <option value="advanced">Advanced</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.role === 'teacher' && (
                                    <div className="space-y-6 pt-4 border-t border-slate-50">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Specialization</label>
                                            <div className="relative group">
                                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                                    placeholder="e.g. Robotics, Web Development"
                                                    value={formData.specialization}
                                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assign Initial Courses</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-100">
                                                {courses.map(course => (
                                                    <label key={course.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-primary transition-all">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                            checked={formData.courseIds.includes(course.id)}
                                                            onChange={() => handleCourseToggle(course.id)}
                                                        />
                                                        <span className="text-xs font-bold text-slate-600 truncate">{course.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 mt-4 bg-primary text-white rounded-[1.5rem] font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
                                >
                                    {isSubmitting ? (
                                        <Loading size="small" variant="inline" message="Registering..." />
                                    ) : (
                                        <>
                                            Register {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
            />
        </div>
    );
};

export default UserRegistration;
