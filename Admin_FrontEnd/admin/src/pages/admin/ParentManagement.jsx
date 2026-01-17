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
    CheckCircle2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import Loading from '../../components/Loading';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const ParentManagement = () => {
    const { parents, registerParent, deleteParent, loading } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
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


    const handleRegister = async (e) => {
        e.preventDefault();
        const result = await registerParent(newParent);
        if (result.success) {
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
        } else {
            alert(result.message || 'Registration failed');
        }
    };

    const handleDeleteClick = (parent) => {
        setParentToDelete(parent);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!parentToDelete) return;

        setIsDeleting(true);
        const result = await deleteParent(parentToDelete.id);
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setParentToDelete(null);

        if (!result.success) {
            alert(result.message);
        }
    };

    const filteredParents = parents.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <button onClick={() => setIsRegistering(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
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
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Username</label>
                            <div className="relative group">
                                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
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
                                onClick={() => setIsRegistering(false)}
                                className="px-8 py-3.5 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-10 py-3.5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 w-full sm:w-auto"
                            >
                                Register Parent
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
                            {loading.parents ? (
                                <tr>
                                    <td colSpan="3">
                                        <Loading fullScreen={false} message="Loading parents..." />
                                    </td>
                                </tr>
                            ) : filteredParents.length > 0 ? (
                                filteredParents.map((parent) => (
                                    <tr key={parent.id} className="hover:bg-slate-50 transition-colors group">
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
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
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
                <div className="p-6 border-t border-slate-100 bg-slate-50/20">
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                        Total Registered Parents: {parents.length}
                    </p>
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
        </div>
    );
};

export default ParentManagement;
