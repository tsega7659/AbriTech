import React, { useState } from 'react';
import {
    Users,
    Search,
    Plus,
    XCircle,
    User,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Lock,
    ArrowRight,
    UserCheck,
    CheckCircle2,
    Loader2,
    Calendar,
    Briefcase,
    Target,
    BookOpen,
    ArrowUpRight,
    Award,
    ShieldCheck
} from 'lucide-react';
import { useParents, useRegisterParent, useDeleteParent, useParentDetails } from '../../hooks/useAdminQueries';
import Loading from '../../components/Loading';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import FeedbackModal from '../../components/FeedbackModal';

const ParentManagement = () => {
    const { data: parents = [], isLoading: parentsLoading } = useParents();
    const registerParentMutation = useRegisterParent();
    const deleteParentMutation = useDeleteParent();
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [newParent, setNewParent] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        gender: 'Male',
        phoneNumber: '',
        address: ''
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [parentToDelete, setParentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
    const [selectedParentId, setSelectedParentId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleRowClick = (parentId) => {
        setSelectedParentId(parentId);
        setIsDetailModalOpen(true);
    };

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };


    const handleCancel = () => {
        setIsRegistering(false);
        setNewParent({
            fullName: '',
            username: '',
            email: '',
            password: '',
            gender: 'Male',
            phoneNumber: '',
            address: ''
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await registerParentMutation.mutateAsync(newParent);
            showFeedback("Success", "Parent registered successfully!", "success");
            setIsRegistering(false);
            setNewParent({
                fullName: '',
                username: '',
                email: '',
                password: '',
                gender: 'Male',
                phoneNumber: '',
                address: ''
            });
        } catch (error) {
            showFeedback("Registration Failed", error.response?.data?.message || 'Registration failed', "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (parent) => {
        setParentToDelete(parent);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!parentToDelete) return;

        setIsDeleting(true);
        try {
            await deleteParentMutation.mutateAsync(parentToDelete.id);
            setIsDeleteModalOpen(false);
            setParentToDelete(null);
        } catch (error) {
            showFeedback("Operation Failed", error.response?.data?.message || "Failed to delete parent", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredParents = parents.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredParents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(filteredParents.length / itemsPerPage));

    return (
        <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800">Parent Management</h1>
                    <p className="text-slate-500 font-bold">Manage parent accounts and their connections to students.</p>
                </div>
                {!isRegistering && (
                    <button
                        onClick={() => setIsRegistering(true)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-black hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95 w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4" /> Add Parent
                    </button>
                )}
            </div>

            {isRegistering && (
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-primary/20 shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Plus className="w-6 h-6 text-primary" /> Register New Parent
                        </h3>
                        <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                            <XCircle className="w-7 h-7" />
                        </button>
                    </div>

                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Parent Name"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newParent.fullName}
                                    onChange={(e) => setNewParent({ ...newParent, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Username <span className="text-slate-300">(Auto-generated if empty)</span></label>
                            <div className="relative group">
                                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="username"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newParent.username}
                                    onChange={(e) => setNewParent({ ...newParent, username: e.target.value })}
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
                                    placeholder="parent@example.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newParent.email}
                                    onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
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
                                    value={newParent.password}
                                    onChange={(e) => setNewParent({ ...newParent, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="tel"
                                    placeholder="+251 ..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newParent.phoneNumber}
                                    onChange={(e) => setNewParent({ ...newParent, phoneNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Address</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Addis Ababa, Ethiopia"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newParent.address}
                                    onChange={(e) => setNewParent({ ...newParent, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-50">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-8 py-3.5 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-10 py-3.5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Registering...
                                    </>
                                ) : (
                                    <>
                                        Register Parent
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
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
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {parentsLoading ? (
                                <tr>
                                    <td colSpan="3">
                                        <Loading fullScreen={false} message="Loading parents..." />
                                    </td>
                                </tr>
                            ) : currentItems.length > 0 ? (
                                currentItems.map((parent) => (
                                    <tr
                                        key={parent.id}
                                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                        onClick={() => handleRowClick(parent.id)}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black shadow-sm ring-1 ring-primary/5">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${parent.fullName}&background=4dbfec&color=fff&rounded=true`}
                                                        alt=""
                                                        className="w-10 h-10 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 tracking-tight">{parent.fullName}</p>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{parent.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-black text-slate-700">{parent.email}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{parent.phoneNumber || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleDeleteClick(parent)}
                                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-12 h-12 text-slate-200" />
                                            <p className="text-slate-500 font-bold">No parents found.</p>
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
                        Showing {filteredParents.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredParents.length)} of {filteredParents.length} parents
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
            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Parent account"
                message="Are you sure you want to delete this parent? This will permanently remove their account and links to their children."
                itemName={parentToDelete?.fullName}
                loading={isDeleting}
            />
            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
            />

            {/* Parent Detail Modal */}
            <ParentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => { setIsDetailModalOpen(false); setSelectedParentId(null); }}
                parentId={selectedParentId}
            />
        </div>
    );
};

const ParentDetailModal = ({ isOpen, onClose, parentId }) => {
    const { data: parent, isLoading } = useParentDetails(parentId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
                {/* Header Section */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 relative bg-slate-50/50">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] p-1.5 ring-4 ring-white shadow-lg overflow-hidden flex items-center justify-center text-primary">
                            <img
                                src={`https://ui-avatars.com/api/?name=${parent?.fullName || 'User'}&background=4dbfec&color=fff&size=200`}
                                alt=""
                                className="w-full h-full rounded-[1rem] object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-black text-slate-800">{parent?.fullName || 'Loading...'}</h3>
                                <span className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-primary/20">
                                    Guardian Account
                                </span>
                            </div>
                            <p className="text-slate-400 font-bold flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4" /> {parent?.email}
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
                            <p className="font-bold text-sm">Retrieving family association data...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column: Personal Info */}
                            <div className="lg:col-span-7 space-y-8">
                                {/* Profile Info */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Guardian Profile
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Username</p>
                                            <p className="font-black text-slate-700">{parent?.username || 'N/A'}</p>
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Mobile</p>
                                            <p className="font-black text-slate-700">{parent?.phoneNumber || 'N/A'}</p>
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 lg:col-span-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Primary Address</p>
                                            <p className="font-black text-slate-700 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" /> {parent?.address || 'No address provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Linked Students */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Linked Students
                                        </h4>
                                        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                                            {parent?.students?.length || 0} Registered
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {parent?.students?.length > 0 ? parent.students.map((student, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:border-primary/20 transition-all shadow-sm group">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center p-1 group-hover:bg-primary/5 transition-colors">
                                                        <img
                                                            src={`https://ui-avatars.com/api/?name=${student.fullName}&background=4dbfec&color=fff&size=100`}
                                                            alt=""
                                                            className="w-full h-full rounded-xl"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 tracking-tight">{student.fullName}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-[9px] font-black uppercase tracking-widest">
                                                                {student.username}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 capitalize">
                                                                {student.classLevel || 'Standard'} Grade
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        )) : (
                                            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Users className="w-8 h-8 text-slate-200" />
                                                </div>
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No students linked to this account</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Account Stats */}
                            <div className="lg:col-span-5 space-y-8">
                                {/* Overview Card */}
                                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full" />
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Platform History</h4>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Member Since</p>
                                            <h5 className="text-xl font-black">{parent?.createdAt ? new Date(parent.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</h5>
                                        </div>

                                        <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Enrolled</p>
                                                <h5 className="text-2xl font-black text-primary">{parent?.totalEnrollments || 0}</h5>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Progress Score</p>
                                                <h5 className="text-2xl font-black text-emerald-400">{parent?.avgProgress || 0}%</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Support Info */}
                                <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                                        <Target className="w-7 h-7 text-primary" />
                                    </div>
                                    <h5 className="text-lg font-black text-slate-800 mb-2">Education Support</h5>
                                    <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">This guardian profile has management rights over their students learning paths and financial settlements.</p>

                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Exit Preview
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ParentManagement;
