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
    Copy
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import Loading from '../../components/Loading';
import FeedbackModal from '../../components/FeedbackModal';

const UserRegistration = () => {
    const {
        registerStudent,
        registerTeacher,
        registerAdmin,
        registerParent,
        courses
    } = useAdmin();

    const [formData, setFormData] = useState({
        fullName: '',
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
        // Teacher specific
        specialization: '',
        courseIds: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
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

        let result;
        if (formData.role === 'student') {
            result = await registerStudent(formData);
        } else if (formData.role === 'teacher') {
            result = await registerTeacher(formData);
        } else if (formData.role === 'admin') {
            result = await registerAdmin(formData);
        } else if (formData.role === 'parent') {
            result = await registerParent(formData);
        }

        setIsSubmitting(false);
        if (result.success) {
            setSuccessData(result.data);
            // Don't reset everything immediately if we need to show credentials
            if (formData.role !== 'teacher') {
                setFormData({
                    ...formData,
                    fullName: '',
                    email: '',
                    password: '',
                    phoneNumber: '',
                    address: '',
                    schoolName: '',
                    classLevel: '',
                    specialization: '',
                    courseIds: []
                });
            }
        } else {
            showFeedback("Registration Failed", result.message || 'Registration failed', "error");
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

                                {formData.role === 'teacher' && successData.username && (
                                    <div className="space-y-4 bg-white p-5 rounded-2x border border-green-200 shadow-sm">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Login Credentials</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Username</p>
                                                <p className="font-black text-slate-800">{successData.username}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Generated Password</p>
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

                                <button
                                    onClick={() => setSuccessData(null)}
                                    className="mt-4 text-xs font-black text-green-600 uppercase tracking-widest hover:underline"
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
                                                    type="password"
                                                    required
                                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phone Number</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="tel"
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                                placeholder="+251 ..."
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
                                        <Loading size="small" fullScreen={false} message="Registering..." />
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
