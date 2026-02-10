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
    ShieldAlert,
    CheckCircle2,
    XCircle,
    User,
    Mail,
    Lock,
    Phone,
    MapPin,
    GraduationCap,
    School,
    Layers,
    UserCheck,
    ArrowRight
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import Loading from '../../components/Loading';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import FeedbackModal from '../../components/FeedbackModal';

const StudentManagement = () => {
    const { students, registerStudent, deleteStudent, loading } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [newStudent, setNewStudent] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        gender: 'Male',
        phoneNumber: '',
        address: '',
        schoolName: '',
        educationLevel: 'Primary',
        classLevel: '',
        isCurrentStudent: false,
        parentEmail: '',
        parentPhone: '',
        courseLevel: 'beginner'
    });

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;

        setIsDeleting(true);
        const result = await deleteStudent(studentToDelete.id);
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);

        if (!result.success) {
            showFeedback("Operation Failed", result.message || "Failed to delete student", "error");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const result = await registerStudent(newStudent);
        if (result.success) {
            showFeedback("Success", "Student registered successfully!", "success");
            setIsRegistering(false);
            setNewStudent({
                fullName: '',
                username: '',
                email: '',
                password: '',
                gender: 'Male',
                phoneNumber: '',
                address: '',
                schoolName: '',
                educationLevel: 'Primary',
                classLevel: '',
                isCurrentStudent: false,
                parentEmail: '',
                parentPhone: '',
                courseLevel: 'beginner'
            });
        } else {
            showFeedback("Registration Failed", result.message || 'Registration failed', "error");
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
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-primary/20 shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Plus className="w-6 h-6 text-primary" /> Register New Student
                        </h3>
                        <button onClick={() => setIsRegistering(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                            <XCircle className="w-7 h-7" />
                        </button>
                    </div>

                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Abebe Kebede"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newStudent.fullName}
                                    onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Username</label>
                            <div className="relative group">
                                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="abebe_k"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newStudent.username}
                                    onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="student@example.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newStudent.password}
                                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="tel"
                                    placeholder="+251 ..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newStudent.phoneNumber}
                                    onChange={(e) => setNewStudent({ ...newStudent, phoneNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Education Level</label>
                            <div className="relative group">
                                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <select
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                    value={newStudent.educationLevel}
                                    onChange={(e) => setNewStudent({ ...newStudent, educationLevel: e.target.value })}
                                >
                                    <option value="Primary">Primary (1-8)</option>
                                    <option value="Secondary">Secondary (9-12)</option>
                                    <option value="University">University / Graduate</option>
                                    <option value="Professional">Professional</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Class Level / Year</label>
                            <div className="relative group">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="e.g. Grade 10, Year 2"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newStudent.classLevel}
                                    onChange={(e) => setNewStudent({ ...newStudent, classLevel: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">School / Institution</label>
                            <div className="relative group">
                                <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="e.g. Tikur Anbessa Secondary"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newStudent.schoolName}
                                    onChange={(e) => setNewStudent({ ...newStudent, schoolName: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Parent Info */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Parent Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    placeholder="parent@example.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newStudent.parentEmail}
                                    onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:col-span-2 lg:col-span-1 py-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={newStudent.isCurrentStudent}
                                    onChange={(e) => setNewStudent({ ...newStudent, isCurrentStudent: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                            <span className="text-sm font-black text-slate-600">Currently Active Student?</span>
                        </div>

                        <div className="md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-50">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(false)}
                                className="px-8 py-3.5 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-10 py-3.5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 w-full sm:w-auto"
                            >
                                Register Student
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
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
                            {loading.students ? (
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
            />
        </div>
    );
};

export default StudentManagement;
