import React, { useState } from 'react';
import {
    Shield,
    ShieldCheck,
    Search,
    Plus,
    User,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Lock,
    UserCheck,
    CheckCircle2,
    Loader2,
    Calendar,
    Award,
    Eye,
    EyeOff,
    Copy,
    Check,
    X,
    Clock,
    Activity,
    Users
} from 'lucide-react';
import { useAdmins, useRegisterAdmin, useDeleteAdmin, useAdminDetails } from '../../hooks/useAdminQueries';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import FeedbackModal from '../../components/FeedbackModal';

const AdminManagement = () => {
    const { user: currentLoggedUser } = useAuth();
    const { data: admins = [], isLoading: adminsLoading } = useAdmins();
    const registerAdminMutation = useRegisterAdmin();
    const deleteAdminMutation = useDeleteAdmin();

    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [copiedUser, setCopiedUser] = useState(false);
    const [copiedPass, setCopiedPass] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const [newAdmin, setNewAdmin] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        gender: 'Male',
        phoneNumber: '',
        address: ''
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const handleRowClick = (adminId) => {
        setSelectedAdminId(adminId);
        setIsDetailModalOpen(true);
    };

    const handleCancel = () => {
        setIsRegistering(false);
        setSuccessData(null);
        setNewAdmin({
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
            const data = await registerAdminMutation.mutateAsync(newAdmin);
            setSuccessData({
                fullName: newAdmin.fullName,
                username: data.username || newAdmin.username,
                email: newAdmin.email,
                password: newAdmin.password
            });
            showFeedback("Success", "Administrator registered successfully!", "success");
            setNewAdmin({
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

    const handleDeleteClick = (admin, e) => {
        e.stopPropagation();
        if (String(currentLoggedUser?.id) === String(admin.id)) {
            showFeedback("Action Restricted", "You cannot delete your own logged-in administrator account.", "error");
            return;
        }
        if (admins.length <= 1) {
            showFeedback("Action Restricted", "Cannot delete the only remaining administrator account.", "error");
            return;
        }
        setAdminToDelete(admin);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!adminToDelete) return;
        setIsDeleting(true);
        try {
            await deleteAdminMutation.mutateAsync(adminToDelete.id);
            setIsDeleteModalOpen(false);
            setAdminToDelete(null);
            showFeedback("Deleted", "Administrator account deleted successfully.", "success");
        } catch (error) {
            showFeedback("Deletion Failed", error.response?.data?.message || "Failed to delete administrator", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        if (type === 'user') {
            setCopiedUser(true);
            setTimeout(() => setCopiedUser(false), 2000);
        } else {
            setCopiedPass(true);
            setTimeout(() => setCopiedPass(false), 2000);
        }
    };

    const filteredAdmins = admins.filter(admin =>
        admin.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.phoneNumber?.includes(searchTerm)
    );

    if (adminsLoading) {
        return <Loading fullScreen={false} message="Loading administrators..." />;
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Administrators</h1>
                            <p className="text-slate-500 font-bold text-sm mt-0.5">
                                Manage platform superusers, system credentials, and privileged accounts.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setSuccessData(null);
                        setIsRegistering(!isRegistering);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    {isRegistering ? 'View Admin List' : 'Register Administrator'}
                </button>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Admins</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-0.5">{admins.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                        <UserCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Accounts</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-0.5">{admins.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 shrink-0">
                        <Award className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Access Level</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-0.5">Superuser</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                        <Shield className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Role Type</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-0.5">Full System</h3>
                    </div>
                </div>
            </div>

            {/* Registration Form (Collapsible or View) */}
            {isRegistering && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 lg:p-10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="max-w-3xl mx-auto">
                        {successData ? (
                            <div className="text-center space-y-6 py-6">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">Admin Registered Successfully!</h2>
                                    <p className="text-sm font-bold text-slate-400 mt-1">
                                        Please share these login credentials securely with the new administrator.
                                    </p>
                                </div>

                                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-left space-y-4 max-w-md mx-auto">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                                        <div className="flex items-center justify-between mt-1 bg-white p-3 rounded-xl border border-slate-200">
                                            <span className="font-mono font-bold text-sm text-slate-800">{successData.username}</span>
                                            <button
                                                onClick={() => copyToClipboard(successData.username, 'user')}
                                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                            >
                                                {copiedUser ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                                        <div className="flex items-center justify-between mt-1 bg-white p-3 rounded-xl border border-slate-200">
                                            <span className="font-mono font-bold text-sm text-slate-800">{successData.password}</span>
                                            <button
                                                onClick={() => copyToClipboard(successData.password, 'pass')}
                                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                            >
                                                {copiedPass ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-3 pt-4">
                                    <button
                                        onClick={() => setSuccessData(null)}
                                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Register Another
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsRegistering(false);
                                            setSuccessData(null);
                                        }}
                                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Back to Admins List
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <h2 className="text-xl font-black text-slate-800">Register New Administrator</h2>
                                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                                        Create a new privileged superuser account with full access to the administration dashboard.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                                            Full Name *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. John Doe"
                                                value={newAdmin.fullName}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:bg-white focus:border-primary/40 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                                            Username (Optional)
                                        </label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Auto-generated if left empty"
                                                value={newAdmin.username}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:bg-white focus:border-primary/40 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="admin@abritech.com"
                                                value={newAdmin.email}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:bg-white focus:border-primary/40 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                                            Password *
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                placeholder="••••••••"
                                                value={newAdmin.password}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                                className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:bg-white focus:border-primary/40 outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                placeholder="+251 91 234 5678"
                                                value={newAdmin.phoneNumber}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, phoneNumber: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:bg-white focus:border-primary/40 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                                            Gender
                                        </label>
                                        <select
                                            value={newAdmin.gender}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, gender: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:bg-white focus:border-primary/40 outline-none transition-all"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>

                                    <div className="col-span-full">
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                                            Office / Address
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                            <textarea
                                                rows="2"
                                                placeholder="Addis Ababa, Ethiopia"
                                                value={newAdmin.address}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, address: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:bg-white focus:border-primary/40 outline-none transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-8 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Register Administrator
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Admin List Table Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">All Administrators</h2>
                        <p className="text-sm font-bold text-slate-400">Total {admins.length} active platform administrators</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-primary/20 outline-none font-bold text-sm w-full md:w-80 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Administrator</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Username</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Contact</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Role</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Joined Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <ShieldCheck className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No administrators found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmins.map((admin) => {
                                    const isCurrentUser = String(currentLoggedUser?.id) === String(admin.id);

                                    return (
                                        <tr
                                            key={admin.id}
                                            onClick={() => handleRowClick(admin.id)}
                                            className="group hover:bg-slate-50/40 transition-all cursor-pointer"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm overflow-hidden shrink-0">
                                                        <img
                                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(admin.fullName || 'Admin')}&background=4dbfec&color=fff`}
                                                            alt={admin.fullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-slate-800 text-sm">{admin.fullName}</span>
                                                            {isCurrentUser && (
                                                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[9px] font-black uppercase">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-400 block">{admin.email}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-8 py-6">
                                                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                    @{admin.username}
                                                </span>
                                            </td>

                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className="text-xs font-bold text-slate-600">
                                                    {admin.phoneNumber || 'N/A'}
                                                </span>
                                            </td>

                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    Admin
                                                </span>
                                            </td>

                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold">
                                                        {admin.lastLogin ? `Last active: ${new Date(admin.lastLogin).toLocaleDateString()}` : 'Never logged in'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-8 py-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleRowClick(admin.id)}
                                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteClick(admin, e)}
                                                        disabled={isCurrentUser || admins.length <= 1}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                                                        title={isCurrentUser ? "Cannot delete yourself" : admins.length <= 1 ? "Cannot delete only admin" : "Delete Administrator"}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Admin Details Modal */}
            <AdminDetailsModal
                adminId={selectedAdminId}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete Administrator"
                message={`Are you sure you want to remove administrator @${adminToDelete?.username} (${adminToDelete?.fullName})? This will permanently revoke their access to the system.`}
                itemName={adminToDelete?.fullName}
            />

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                title={feedbackModal.title}
                message={feedbackModal.message}
                type={feedbackModal.type}
            />
        </div>
    );
};

// Admin Details Modal Component
const AdminDetailsModal = ({ adminId, isOpen, onClose }) => {
    const { data: admin, isLoading } = useAdminDetails(adminId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            />

            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-10 p-8 lg:p-10 animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <Loading fullScreen={false} message="Loading details..." />
                    </div>
                ) : admin ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl overflow-hidden shrink-0">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(admin.fullName || 'Admin')}&background=4dbfec&color=fff`}
                                    alt={admin.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">{admin.fullName}</h3>
                                <p className="font-mono text-xs font-bold text-slate-400 mt-0.5">@{admin.username}</p>
                                <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-black uppercase">
                                    <ShieldCheck className="w-3 h-3" /> Administrator
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email</span>
                                <span className="text-slate-800 font-semibold break-all">{admin.email}</span>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Phone Number</span>
                                <span className="text-slate-800 font-semibold">{admin.phoneNumber || 'Not provided'}</span>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Gender</span>
                                <span className="text-slate-800 font-semibold">{admin.gender || 'Not specified'}</span>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Joined Date</span>
                                <span className="text-slate-800 font-semibold">
                                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>

                            <div className="col-span-full p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Address / Office</span>
                                <span className="text-slate-800 font-semibold">{admin.address || 'No address provided'}</span>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-slate-400 font-bold">Administrator details not found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminManagement;
