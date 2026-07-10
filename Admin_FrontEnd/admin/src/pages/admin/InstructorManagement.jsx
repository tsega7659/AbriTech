import React, { useState } from 'react';
import {
    UserPlus,
    Search,
    Mail,
    ShieldCheck,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Link2,
    MapPin,
    Phone,
    Info,
    Copy,
    Check,
    Loader2,
    Calendar,
    Award,
    BookOpen,
    Target,
    Users,
    Zap,
    Briefcase,
    Trophy
} from 'lucide-react';
import {
    useTeachers,
    useAdminCourses,
    useRegisterTeacher,
    useDeleteTeacher,
    useInstructorDetails,
    useAssignInstructorCourses,
    useUpdateTeacherSpecialization
} from '../../hooks/useAdminQueries';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import Loading from '../../components/Loading';
import FeedbackModal from '../../components/FeedbackModal';


const InstructorManagement = () => {
    const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
    const { data: courses = [] } = useAdminCourses();
    const registerTeacherMutation = useRegisterTeacher();
    const deleteTeacherMutation = useDeleteTeacher();

    const loading = teachersLoading;
    const [isRegistering, setIsRegistering] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
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
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleViewDetail = (teacherId) => {
        setSelectedTeacherId(teacherId);
        setIsDetailModalOpen(true);
    };

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const handleDeleteClick = (teacher) => {
        setTeacherToDelete(teacher);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!teacherToDelete) return;

        setIsDeleting(true);
        try {
            await deleteTeacherMutation.mutateAsync(teacherToDelete.userId || teacherToDelete.id);
            setIsDeleteModalOpen(false);
            setTeacherToDelete(null);
        } catch (error) {
            showFeedback("Operation Failed", error.response?.data?.message || "Failed to delete instructor", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const [copied, setCopied] = useState({ user: false, pass: false });

    const handleRegister = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Convert courseIds to numbers to ensure proper type validation
            const instructorData = {
                ...newInstructor,
                courseIds: newInstructor.courseIds.map(id => Number(id))
            };
            const data = await registerTeacherMutation.mutateAsync(instructorData);
            setRegistrationResult(data);
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
        } catch (error) {
            showFeedback("Registration Failed", error.response?.data?.message || 'Registration failed', "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
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

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / itemsPerPage));

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
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
                        <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
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
                                    required
                                    placeholder="09XXXXXXXX"
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
                                onClick={handleCancel}
                                className="px-8 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-10 py-3.5 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95 w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Registering...
                                    </>
                                ) : (
                                    'Complete Registration'
                                )}
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
            {teachersLoading ? (
                <Loading fullScreen={false} message="Loading instructors..." />
            ) : currentItems.length > 0 ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {currentItems.map((inst) => (
                            <div key={inst.id || inst.userId} onClick={() => handleViewDetail(inst.id || inst.userId)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden cursor-pointer">
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
                                            {Array.isArray(inst.assignedCourses) && inst.assignedCourses.length > 0 ? inst.assignedCourses.map((c, i) => (
                                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tight ring-1 ring-blue-100">
                                                    {c}
                                                </span>
                                            )) : (
                                                <span className="text-[10px] font-bold text-slate-400 italic">No courses assigned</span>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); handleViewDetail(inst.id); }} className="px-3 py-1 border border-dashed border-slate-300 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-tight hover:border-primary hover:text-primary transition-all">
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

                                            <button
                                                onClick={() => handleViewDetail(inst.id)}
                                                className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline"
                                            >
                                                Manage Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="p-6 border border-slate-100 rounded-[1.5rem] bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left mt-6">
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                            Showing {filteredTeachers.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredTeachers.length)} of {filteredTeachers.length} instructors
                        </p>
                        {totalPages > 1 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white text-slate-700 shadow-sm transition-all disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white text-slate-700 shadow-sm transition-all disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
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
            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
            />

            {/* Instructor Detail Modal */}
            <InstructorDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => { setIsDetailModalOpen(false); setSelectedTeacherId(null); }}
                teacherId={selectedTeacherId}
                allCourses={courses}
            />
        </div>

    );
};

const InstructorDetailModal = ({ isOpen, onClose, teacherId, allCourses }) => {
    const { data: instructor, isLoading } = useInstructorDetails(teacherId);
    const assignCoursesMutation = useAssignInstructorCourses();

    const [isEditingCourses, setIsEditingCourses] = useState(false);
    const [tempCourseIds, setTempCourseIds] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isProfessionModalOpen, setIsProfessionModalOpen] = useState(false);

    // Initialize tempCourseIds when entering edit mode
    React.useEffect(() => {
        if (isEditingCourses && instructor?.assignedCourses) {
            setTempCourseIds(instructor.assignedCourses.map(c => c.id));
        }
    }, [isEditingCourses, instructor]);

    if (!isOpen) return null;

    const handleSaveCourses = async () => {
        setIsSaving(true);
        try {
            await assignCoursesMutation.mutateAsync({ userId: teacherId, courseIds: tempCourseIds });
            setIsEditingCourses(false);
        } catch (error) {
            console.error('Failed to assign courses:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
                {/* Header Section */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 relative bg-slate-50/50">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] p-1.5 ring-4 ring-white shadow-lg overflow-hidden">
                            <img
                                src={`https://ui-avatars.com/api/?name=${instructor?.fullName || 'User'}&background=4dbfec&color=fff&size=200`}
                                alt=""
                                className="w-full h-full rounded-[1rem] object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-black text-slate-800">{instructor?.fullName || 'Loading...'}</h3>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-blue-500/20">
                                    Certified Instructor
                                </span>
                            </div>
                            <p className="text-slate-400 font-bold flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4" /> {instructor?.email}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl border border-slate-100 transition-all active:scale-95 shadow-sm">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <p className="font-bold text-sm">Loading instructor expertise...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column: Proffesional Details */}
                            <div className="lg:col-span-7 space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" /> Professional Profile
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 lg:col-span-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Specialization</p>
                                            <p className="font-black text-slate-700 text-lg leading-tight">{instructor?.specialization || 'General Technical Education'}</p>
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Gender</p>
                                            <p className="font-black text-slate-700">{instructor?.gender || 'N/A'}</p>
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                <span className="font-black text-slate-700 uppercase text-[11px]">Active Instructor</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Assigned Courses */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" /> Teaching Portfolio
                                        </h4>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">
                                                {instructor?.assignedCourses?.length || 0} ACTIVE COURSES
                                            </span>
                                            {!isEditingCourses && (
                                                <button
                                                    onClick={() => setIsEditingCourses(true)}
                                                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                                >
                                                    Manage Courses
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {isEditingCourses ? (
                                        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                            <p className="text-xs font-bold text-slate-500 mb-4">Select courses to assign to {instructor?.fullName}</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                                {allCourses?.map((c) => (
                                                    <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${tempCourseIds.includes(c.id) ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                                                            checked={tempCourseIds.includes(c.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setTempCourseIds([...tempCourseIds, c.id]);
                                                                else setTempCourseIds(tempCourseIds.filter(id => id !== c.id));
                                                            }}
                                                        />
                                                        <span className={`text-sm font-bold ${tempCourseIds.includes(c.id) ? 'text-primary' : 'text-slate-600'}`}>{c.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                                                <button
                                                    onClick={() => setIsEditingCourses(false)}
                                                    className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 rounded-xl transition-colors"
                                                    disabled={isSaving}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveCourses}
                                                    className="px-6 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Assignments'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {instructor?.assignedCourses?.length > 0 ? instructor.assignedCourses.map((c, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 transition-all shadow-sm group">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors ring-1 ring-slate-100 group-hover:ring-primary/20">
                                                        <Zap className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-700 text-sm">{c.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ongoing Module</p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="lg:col-span-2 py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Courses Assigned</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Contact & Stats */}
                            <div className="lg:col-span-5 space-y-8">
                                {/* Contact Card */}
                                <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="w-20 h-20" />
                                    </div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> Contact Information
                                    </h4>
                                    <div className="space-y-5 relative">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/50">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Email</p>
                                                <p className="font-bold text-sm tracking-tight">{instructor?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/50">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Mobile</p>
                                                <p className="font-bold text-sm tracking-tight">{instructor?.phoneNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/50">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Address</p>
                                                <p className="font-bold text-sm tracking-tight">{instructor?.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Close Profile
                    </button>
                    <button
                        onClick={() => setIsProfessionModalOpen(true)}
                        className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                    >
                        Edit Profession
                    </button>
                </div>
            </div>

            <ProfessionEditModal
                isOpen={isProfessionModalOpen}
                onClose={() => setIsProfessionModalOpen(false)}
                userId={teacherId}
                fullName={instructor?.fullName}
                currentSpecialization={instructor?.specialization}
            />
        </div>
    );
};

export default InstructorManagement;

const ProfessionEditModal = ({ isOpen, onClose, userId, fullName, currentSpecialization }) => {
    const updateSpecializationMutation = useUpdateTeacherSpecialization();
    const [specialization, setSpecialization] = useState(currentSpecialization || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (isOpen) setSpecialization(currentSpecialization || '');
    }, [isOpen, currentSpecialization]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await updateSpecializationMutation.mutateAsync({
                userId,
                specialization
            });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profession');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-800">Edit Profession</h3>
                    <p className="text-slate-500 text-xs font-bold mt-1">Update specialization for {fullName}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialization / Profession</label>
                        <input
                            type="text"
                            placeholder="e.g. Senior Math Instructor"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !specialization.trim()}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSubmitting ? 'Updating...' : 'Update Profession'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
