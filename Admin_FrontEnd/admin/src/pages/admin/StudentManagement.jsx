import React, { useState } from 'react';
import {
    Users,
    Search,
    Filter,
    Download,
    Plus,
    MoreVertical,
    Trash2,
    Edit2,
    CheckCircle2,
    XCircle,
    School,
    GraduationCap,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { useStudentsList, useRegisterStudent, useDeleteStudent } from '../../hooks/useAdminQueries';
import Loading from '../../components/Loading';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import FeedbackModal from '../../components/FeedbackModal';

const StudentManagement = () => {
    const { data: students = [], isLoading: studentsLoading } = useStudentsList();
    const registerStudentMutation = useRegisterStudent();
    const deleteStudentMutation = useDeleteStudent();
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // Multi-step form state
    const [regStep, setRegStep] = useState(1);
    const [studentType, setStudentType] = useState(null); // 'enrolled' or 'finished'
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        fullName: '', username: '', email: '', password: '',
        gender: '', phoneNumber: '', address: '',
        schoolName: '', educationLevel: '', classLevel: '',
        isCurrentStudent: false,
        parentEmail: '', parentPhone: '',
        courseLevel: 'beginner'
    });

    const resetForm = () => {
        setRegStep(1);
        setStudentType(null);
        setFormErrors({});
        setFormData({
            fullName: '', username: '', email: '', password: '',
            gender: '', phoneNumber: '', address: '',
            schoolName: '', educationLevel: '', classLevel: '',
            isCurrentStudent: false,
            parentEmail: '', parentPhone: '',
            courseLevel: 'beginner'
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const validateStep = (s) => {
        const errs = {};
        if (s === 2) {
            if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
            else if (!/^[a-zA-Z\s\/]+$/.test(formData.fullName)) errs.fullName = 'Name can only contain letters, spaces, and "/"';
            if (!formData.gender) errs.gender = 'Gender is required';
            if (!formData.educationLevel) errs.educationLevel = 'Education Level is required';
            if (studentType === 'enrolled') {
                if (!formData.schoolName.trim()) errs.schoolName = 'School Name is required';
                if (!formData.classLevel.trim()) errs.classLevel = 'Grade/Class is required';
            } else {
                if (!formData.address.trim()) errs.address = 'Address is required';
            }
            if (!formData.phoneNumber.trim()) errs.phoneNumber = 'Phone number is required';
            else if (!/^09\d{8}$/.test(formData.phoneNumber.trim())) errs.phoneNumber = 'Must start with 09 and be 10 digits';
        }
        if (s === 3) {
            if (!formData.email.trim()) errs.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format';
            if (!formData.username.trim()) errs.username = 'Username is required';
            if (!formData.password) errs.password = 'Password is required';
            else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
            else if (!(/[a-zA-Z]/.test(formData.password) && /\d/.test(formData.password))) errs.password = 'Must contain letters and numbers';
            if (studentType === 'enrolled') {
                if (!formData.parentEmail.trim()) errs.parentEmail = 'Parent Email is required';
                else if (!/\S+@\S+\.\S+/.test(formData.parentEmail)) errs.parentEmail = 'Invalid email format';
            }
        }
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => { if (validateStep(regStep)) setRegStep(s => s + 1); };
    const handleBack = () => { setFormErrors({}); setRegStep(s => s - 1); };

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success', errors: [] });

    const showFeedback = (title, message, type = 'success', errors = []) => {
        setFeedbackModal({ isOpen: true, title, message, type, errors });
    };

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;
        setIsDeleting(true);
        try {
            await deleteStudentMutation.mutateAsync(studentToDelete.id);
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
        } catch (error) {
            showFeedback("Operation Failed", error.response?.data?.message || "Failed to delete student", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateStep(3)) return;
        setSubmitting(true);
        try {
            const payload = { ...formData, isCurrentStudent: studentType === 'enrolled' };
            await registerStudentMutation.mutateAsync(payload);
            showFeedback("Success", "Student registered successfully!", "success");
            setIsRegistering(false);
            resetForm();
        } catch (error) {
            const data = error.response?.data;
            const errMsg = data?.message || 'Registration failed. Please check your inputs.';
            const errList = data?.errors || [];
            showFeedback("Registration Failed", errMsg, "error", errList);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800">Student Management</h1>
                    <p className="text-slate-500 font-bold">Manage all enrolled students, track progress, and update account statuses.</p>
                </div>
                {!isRegistering && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <button
                            onClick={() => setIsRegistering(true)}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-black hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95 w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4" /> Add Student
                        </button>
                    </div>
                )}
            </div>

            {isRegistering && (
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-primary/20 shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-top-4 duration-300 max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">Register New Student</h3>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">Step {regStep} of 3</p>
                        </div>
                        <button onClick={() => { setIsRegistering(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                            <XCircle className="w-7 h-7" />
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mb-8 overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${(regStep / 3) * 100}%` }} />
                    </div>

                    {/* Step 1: Student Type */}
                    {regStep === 1 && (
                        <div className="space-y-4">
                            <h4 className="font-black text-slate-700 mb-4">This student is currently...</h4>
                            <button
                                type="button"
                                onClick={() => { setStudentType('enrolled'); setRegStep(2); }}
                                className="w-full flex items-center p-4 border-2 border-slate-100 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <School className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="font-black text-slate-800">Enrolled in School</p>
                                    <p className="text-sm text-slate-500">Currently attending a school or institution.</p>
                                </div>
                                <ArrowRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-primary" />
                            </button>
                            <button
                                type="button"
                                onClick={() => { setStudentType('finished'); setRegStep(2); }}
                                className="w-full flex items-center p-4 border-2 border-slate-100 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-all text-left group"
                            >
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="font-black text-slate-800">Finished / Out of School</p>
                                    <p className="text-sm text-slate-500">Has completed school or is on a break.</p>
                                </div>
                                <ArrowRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-amber-400" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Personal Details */}
                    {regStep === 2 && (
                        <div className="space-y-4">
                            <h4 className="font-black text-slate-700 mb-2">Personal Details</h4>
                            {/* Full Name */}
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Full Name</label>
                                <input
                                    type="text" name="fullName" value={formData.fullName} onChange={handleFormChange}
                                    placeholder="e.g. Abebe Kebede"
                                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all ${formErrors.fullName ? 'border-red-300 focus:border-red-400' : 'border-slate-100 focus:border-primary'}`}
                                />
                                {formErrors.fullName && <p className="text-xs text-red-500 font-bold mt-1 ml-1">• {formErrors.fullName}</p>}
                            </div>
                            {/* Gender + Education Level */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleFormChange}
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all ${formErrors.gender ? 'border-red-300' : 'border-slate-100 focus:border-primary'}`}>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    {formErrors.gender && <p className="text-xs text-red-500 font-bold mt-1 ml-1">• {formErrors.gender}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Education Level</label>
                                    <select name="educationLevel" value={formData.educationLevel} onChange={handleFormChange}
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all ${formErrors.educationLevel ? 'border-red-300' : 'border-slate-100 focus:border-primary'}`}>
                                        <option value="">Select Level</option>
                                        <option value="Primary">Primary</option>
                                        <option value="High School">High School</option>
                                        <option value="University">University</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {formErrors.educationLevel && <p className="text-xs text-red-500 font-bold mt-1 ml-1">• {formErrors.educationLevel}</p>}
                                </div>
                            </div>
                            {/* Enrolled: school + class | Finished: address */}
                            {studentType === 'enrolled' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">School Name</label>
                                        <input type="text" name="schoolName" value={formData.schoolName} onChange={handleFormChange} placeholder="e.g. Tikur Anbessa"
                                            className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all ${formErrors.schoolName ? 'border-red-300' : 'border-slate-100 focus:border-primary'}`} />
                                        {formErrors.schoolName && <p className="text-xs text-red-500 font-bold mt-1 ml-1">• {formErrors.schoolName}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Grade / Class</label>
                                        <input type="text" name="classLevel" value={formData.classLevel} onChange={handleFormChange} placeholder="e.g. 10B"
                                            className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all ${formErrors.classLevel ? 'border-red-300' : 'border-slate-100 focus:border-primary'}`} />
                                        {formErrors.classLevel && <p className="text-xs text-red-500 font-bold mt-1 ml-1">• {formErrors.classLevel}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleFormChange} placeholder="Current address"
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all ${formErrors.address ? 'border-red-300' : 'border-slate-100 focus:border-primary'}`} />
                                    {formErrors.address && <p className="text-xs text-red-500 font-bold mt-1 ml-1">• {formErrors.address}</p>}
                                </div>
                            )}
                            {/* Phone */}
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Phone Number</label>
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange} placeholder="09XXXXXXXX"
                                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all ${formErrors.phoneNumber ? 'border-red-300' : 'border-slate-100 focus:border-primary'}`} />
                                {formErrors.phoneNumber && <p className="text-xs text-red-500 font-bold mt-1 ml-1">• {formErrors.phoneNumber}</p>}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setRegStep(1)} className="w-full py-3 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all">Back</button>
                                <button type="button" onClick={handleNext} className="w-full py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Next Step</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Account & Security */}
                    {regStep === 3 && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <h4 className="font-black text-slate-700 mb-2">Account & Security</h4>
                            {/* Email + Username */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="student@example.com"
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all ${formErrors.email ? 'border-red-300' : 'border-slate-100 focus:border-primary'}`} />
                                    {formErrors.email && <p className="text-xs text-red-500 font-bold mt-1 ml-1">• {formErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Username</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleFormChange} placeholder="abebe_k"
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all ${formErrors.username ? 'border-red-300' : 'border-slate-100 focus:border-primary'}`} />
                                    {formErrors.username && <p className="text-xs text-red-500 font-bold mt-1 ml-1">• {formErrors.username}</p>}
                                </div>
                            </div>
                            {/* Password */}
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder="••••••••"
                                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all ${formErrors.password ? 'border-red-300' : 'border-slate-100 focus:border-primary'}`} />
                                {formErrors.password && <p className="text-xs text-red-500 font-bold mt-1 ml-1">• {formErrors.password}</p>}
                            </div>
                            {/* Guardian Details (enrolled only) */}
                            {studentType === 'enrolled' && (
                                <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl space-y-3">
                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Guardian Details (for referral code)</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleFormChange} placeholder="Parent Email"
                                                className={`w-full px-3 py-2.5 border rounded-xl text-sm font-bold text-slate-700 outline-none bg-white ${formErrors.parentEmail ? 'border-red-300' : 'border-slate-200 focus:border-primary'}`} />
                                            {formErrors.parentEmail && <p className="text-xs text-red-500 font-bold mt-1">• {formErrors.parentEmail}</p>}
                                        </div>
                                        <div>
                                            <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleFormChange} placeholder="Parent Phone (09...)"
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none bg-white focus:border-primary" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Course Level */}
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Preferred Course Level</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['beginner', 'intermediate', 'advanced'].map(level => (
                                        <button key={level} type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, courseLevel: level }))}
                                            className={`py-2.5 rounded-xl text-xs font-black border capitalize transition-all ${formData.courseLevel === level ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={handleBack} className="w-full py-3 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all">Back</button>
                                <button type="submit" disabled={submitting}
                                    className="w-full py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</> : <>Register Student <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Filters & Search */}
            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or username..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-colors">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                    <select className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors appearance-none cursor-pointer">
                        <option>Status: All</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">School Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {studentsLoading ? (
                                <tr>
                                    <td colSpan="5">
                                        <Loading fullScreen={false} message="Loading students..." />
                                    </td>
                                </tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black shadow-sm ring-1 ring-primary/5">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${student.fullName}&background=4dbfec&color=fff&rounded=true`}
                                                        alt=""
                                                        className="w-10 h-10 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 tracking-tight">{student.fullName}</p>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 hidden lg:table-cell">
                                            <p className="text-xs font-black text-slate-700">{student.schoolName || 'N/A'}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{student.classLevel || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest ring-1 ring-blue-100">
                                                {student.courseLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${student.isCurrentStudent ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-slate-50 text-slate-600 ring-slate-600/20'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${student.isCurrentStudent ? 'bg-green-600' : 'bg-slate-400'}`} />
                                                {student.isCurrentStudent ? 'Current' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                                <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Edit Student">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(student)}
                                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-12 h-12 text-slate-200" />
                                            <p className="text-slate-500 font-bold">No students found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20 text-center sm:text-left">
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                        Total Enrolled Students: {students.length}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white text-slate-400 transition-all disabled:opacity-50" disabled>Previous</button>
                        <button className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white text-slate-700 shadow-sm transition-all">Next</button>
                    </div>
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Student account"
                message="Are you sure you want to delete this student? This will permanently remove their account, enrollment history, and all associated data."
                itemName={studentToDelete?.fullName}
                loading={isDeleting}
            />
            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
                errors={feedbackModal.errors || []}
            />
        </div>
    );
};

export default StudentManagement;
