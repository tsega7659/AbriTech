import React, { useState } from 'react';
import {
    UserPlus,
    Search,
    BookOpen,
    Mail,
    Lock,
    ShieldCheck,
    MoreHorizontal,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Link2,
    MapPin,
    Phone,
    Info,
    Copy,
    Check
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';


const InstructorManagement = () => {
    const { teachers, courses, registerTeacher, deleteTeacher, loading } = useAdmin();
    const [isRegistering, setIsRegistering] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [registrationResult, setRegistrationResult] = useState(null);
    const [newInstructor, setNewInstructor] = useState({
        fullName: '',
        email: '',
        gender: 'Male',
        phoneNumber: '',
        address: '',
        specialization: '',
        courseIds: []
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (teacher) => {
        setTeacherToDelete(teacher);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!teacherToDelete) return;

        setIsDeleting(true);
        const result = await deleteTeacher(teacherToDelete.userId || teacherToDelete.id);
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setTeacherToDelete(null);

        if (!result.success) {
            alert(result.message);
        }
    };

    const [copied, setCopied] = useState({ user: false, pass: false });

    const handleRegister = async (e) => {
        e.preventDefault();
        const result = await registerTeacher(newInstructor);
        if (result.success) {
            setRegistrationResult(result.data);
            setIsRegistering(false);
            setNewInstructor({
                fullName: '',
                email: '',
                gender: 'Male',
                phoneNumber: '',
                address: '',
                specialization: '',
                courseIds: []
            });
        } else {
            alert(result.message || 'Registration failed');
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [type]: true });
        setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    };

    const filteredTeachers = teachers.filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 max-w-[1600px] mx-auto font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Instructors</h1>
                    <p className="text-slate-500 text-sm font-semibold">Register and manage instructors and their course assignments</p>
                </div>
                {!isRegistering && !registrationResult && (
                    <button
                        onClick={() => setIsRegistering(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95 w-full md:w-auto"
                    >
                        <UserPlus className="w-5 h-5" /> Register Instructor
                    </button>
                )}
            </div>

            {/* Registration Result (Success Modal-like) */}
            {registrationResult && (
                <div className="bg-green-50/50 p-6 md:p-8 rounded-[2rem] border-2 border-green-200 border-dashed animate-in fade-in zoom-in duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <button onClick={() => setRegistrationResult(null)} className="text-green-600 hover:text-green-800 transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-black text-green-800 mb-1">Teacher Registered Successfully!</h3>
                            <p className="text-green-700 font-bold text-sm mb-4">Credentials have been generated and sent to their email.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Generated Username</label>
                                    <div className="flex items-center justify-between font-mono font-bold text-slate-700">
                                        <span>{registrationResult.username}</span>
                                        <button onClick={() => copyToClipboard(registrationResult.username, 'user')} className="text-slate-400 hover:text-primary p-1">
                                            {copied.user ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Temporary Password</label>
                                    <div className="flex items-center justify-between font-mono font-bold text-slate-700">
                                        <span>{registrationResult.password}</span>
                                        <button onClick={() => copyToClipboard(registrationResult.password, 'pass')} className="text-slate-400 hover:text-primary p-1">
                                            {copied.pass ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isRegistering && (
                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-primary/20 shadow-xl shadow-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" /> Register New Instructor
                        </h3>
                        <button onClick={() => setIsRegistering(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Dr. Abebe Kebede"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newInstructor.fullName}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="instructor@abritech.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newInstructor.email}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="tel"
                                    placeholder="+251 ..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newInstructor.phoneNumber}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, phoneNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Work Address / Location</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Addis Ababa, Ethiopia"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newInstructor.address}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Specialization</label>
                            <div className="relative group">
                                <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="e.g. Computer Science, Robotics"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newInstructor.specialization}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, specialization: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assign Initial Courses</label>
                            <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                {courses.length > 0 ? courses.map((c) => (
                                    <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-lg border-2 border-slate-300 text-primary focus:ring-primary/20 cursor-pointer lg:w-4 lg:h-4"
                                            checked={newInstructor.courseIds.includes(c.id)}
                                            onChange={(e) => {
                                                const ids = e.target.checked
                                                    ? [...newInstructor.courseIds, c.id]
                                                    : newInstructor.courseIds.filter(id => id !== c.id);
                                                setNewInstructor({ ...newInstructor, courseIds: ids });
                                            }}
                                        />
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">{c.name}</span>
                                    </label>
                                )) : (
                                    <p className="text-xs font-bold text-slate-400 italic">No courses available to assign. Please add courses first.</p>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-3 flex flex-col sm:flex-row justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(false)}
                                className="px-8 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-10 py-3.5 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95 w-full sm:w-auto"
                            >
                                Complete Registration
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search instructors by name or email..."
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Instructors List */}
            {loading.teachers ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
                    <p className="text-slate-500 font-bold">Loading instructors...</p>
                </div>
            ) : filteredTeachers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredTeachers.map((inst) => (
                        <div key={inst.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden">
                            {/* Card Background Accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] -mr-8 -mt-8 transition-all group-hover:bg-primary/10" />

                            <div className="flex justify-between items-start mb-6 relative">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden ring-4 ring-slate-50 shrink-0">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${inst.fullName}&background=4dbfec&color=fff`}
                                            alt={inst.fullName}
                                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=User&background=cbd5e1&color=fff' }}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate pr-2">{inst.fullName}</h4>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">
                                            <Mail className="w-3 h-3 shrink-0" /> {inst.email}
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-slate-800 transition-colors shrink-0">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 relative">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Link2 className="w-3 h-3" /> Assigned Courses
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {inst.assignedCourses && inst.assignedCourses[0] !== null ? inst.assignedCourses.map((c, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tight ring-1 ring-blue-100">
                                                {c}
                                            </span>
                                        )) : (
                                            <span className="text-[10px] font-bold text-slate-400 italic">No courses assigned</span>
                                        )}
                                        <button className="px-3 py-1 border border-dashed border-slate-300 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-tight hover:border-primary hover:text-primary transition-all">
                                            + Assign
                                        </button>
                                    </div>
                                </div>

                                {inst.specialization && (
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <ShieldCheck className="w-3 h-3" /> Specialization
                                        </p>
                                        <p className="text-xs font-bold text-slate-600 ml-4.5">{inst.specialization}</p>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        <CheckCircle2 className="w-3 h-3" /> Active
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleDeleteClick(inst)}
                                            className="text-[11px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                        >
                                            Delete
                                        </button>

                                        <button className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline">
                                            Manage Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white py-20 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                        <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No instructors found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Try adjusting your search term or register a new instructor to get started.</p>
                </div>
            )}

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setTeacherToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Instructor"
                message="Are you sure you want to delete this instructor? This will also remove their user account and all course assignments. This action cannot be undone."
                itemName={teacherToDelete?.fullName}
                loading={isDeleting}
            />
        </div>

    );
};

export default InstructorManagement;
