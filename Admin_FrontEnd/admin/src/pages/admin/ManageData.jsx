import React, { useState } from 'react';
import {
    Database,
    Trash2,
    AlertTriangle,
    ShieldAlert,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Search,
    Check,
    X,
    Loader2,
    GraduationCap,
    UserCheck,
    Users,
    BookOpen,
    TrendingUp,
    CheckSquare,
    CreditCard,
    FileText,
    MessageSquare,
    Bot,
    Sparkles,
    Layers,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataStats, useClearData } from '../../hooks/useAdminQueries';
import Loading from '../../components/Loading';

// Icon mapper for dynamic category icons
const ICON_MAP = {
    GraduationCap,
    UserCheck,
    Users,
    BookOpen,
    TrendingUp,
    CheckSquare,
    CreditCard,
    FileText,
    MessageSquare,
    Bot
};

const COLOR_CLASSES = {
    blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        activeBg: 'bg-blue-500/10',
        badge: 'bg-blue-100/60 text-blue-700'
    },
    emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        activeBg: 'bg-emerald-500/10',
        badge: 'bg-emerald-100/60 text-emerald-700'
    },
    violet: {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        border: 'border-violet-200',
        activeBg: 'bg-violet-500/10',
        badge: 'bg-violet-100/60 text-violet-700'
    },
    amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        activeBg: 'bg-amber-500/10',
        badge: 'bg-amber-100/60 text-amber-700'
    },
    cyan: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
        border: 'border-cyan-200',
        activeBg: 'bg-cyan-500/10',
        badge: 'bg-cyan-100/60 text-cyan-700'
    },
    indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        activeBg: 'bg-indigo-500/10',
        badge: 'bg-indigo-100/60 text-indigo-700'
    },
    green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        activeBg: 'bg-green-500/10',
        badge: 'bg-green-100/60 text-green-700'
    },
    orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        activeBg: 'bg-orange-500/10',
        badge: 'bg-orange-100/60 text-orange-700'
    },
    rose: {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-200',
        activeBg: 'bg-rose-500/10',
        badge: 'bg-rose-100/60 text-rose-700'
    },
    fuchsia: {
        bg: 'bg-fuchsia-50',
        text: 'text-fuchsia-600',
        border: 'border-fuchsia-200',
        activeBg: 'bg-fuchsia-500/10',
        badge: 'bg-fuchsia-100/60 text-fuchsia-700'
    }
};

const ManageData = () => {
    const { data: statsData, isLoading, isFetching, refetch } = useDataStats();
    const clearDataMutation = useClearData();

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState(null);

    // Modal States
    const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
    const [wipeConfirmText, setWipeConfirmText] = useState('');
    const [isSelectiveModalOpen, setIsSelectiveModalOpen] = useState(false);
    const [selectiveConsentChecked, setSelectiveConsentChecked] = useState(false);

    const categories = statsData?.categories || [];
    const totalRecords = statsData?.totalRecords || 0;
    const adminsCount = statsData?.adminsCount || 1;

    // Filter categories based on search
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Toggle category selection
    const toggleCategory = (id) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectedCategories(filteredCategories.map(c => c.id));
    };

    const handleDeselectAll = () => {
        setSelectedCategories([]);
    };

    // Calculate count of selected items
    const selectedRecordsCount = categories
        .filter(c => selectedCategories.includes(c.id))
        .reduce((sum, c) => sum + c.count, 0);

    // Handle Wipe All Confirm
    const handleWipeAll = async () => {
        if (wipeConfirmText !== 'CLEAR DATABASE') return;
        try {
            const res = await clearDataMutation.mutateAsync({ mode: 'all' });
            setNotification({
                type: 'success',
                title: 'Database Reset Successful',
                message: res.message || 'All non-admin data has been wiped from the database.'
            });
            setIsWipeModalOpen(false);
            setWipeConfirmText('');
            setSelectedCategories([]);
            refetch();
        } catch (error) {
            setNotification({
                type: 'error',
                title: 'Database Reset Failed',
                message: error.response?.data?.message || error.message || 'An error occurred while resetting the database.'
            });
        }
    };

    // Handle Selective Clear Confirm
    const handleSelectiveClear = async () => {
        if (!selectiveConsentChecked || selectedCategories.length === 0) return;
        try {
            const res = await clearDataMutation.mutateAsync({
                mode: 'selected',
                targets: selectedCategories
            });
            setNotification({
                type: 'success',
                title: 'Data Cleared Successfully',
                message: res.message || `Cleared ${selectedCategories.length} data categories successfully.`
            });
            setIsSelectiveModalOpen(false);
            setSelectiveConsentChecked(false);
            setSelectedCategories([]);
            refetch();
        } catch (error) {
            setNotification({
                type: 'error',
                title: 'Selective Clear Failed',
                message: error.response?.data?.message || error.message || 'An error occurred while clearing data.'
            });
        }
    };

    if (isLoading) {
        return <Loading fullScreen={false} message="Loading database metrics..." />;
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                            <Database className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manage Data</h1>
                            <p className="text-slate-500 font-bold text-sm mt-0.5">
                                Purge test records, filter data by module, or perform a complete database reset.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-black">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{adminsCount} Admin account{adminsCount > 1 ? 's' : ''} protected</span>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-primary' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-5 rounded-3xl border flex items-start justify-between gap-4 ${
                            notification.type === 'success'
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                : 'bg-rose-50/80 border-rose-200 text-rose-900'
                        }`}
                    >
                        <div className="flex items-start gap-3.5">
                            {notification.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                                <h4 className="font-black text-sm">{notification.title}</h4>
                                <p className="text-xs font-semibold opacity-90 mt-0.5">{notification.message}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="p-1 rounded-lg hover:bg-black/5 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                        <Layers className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Records</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalRecords.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                        <Database className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Modules</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-0.5">{categories.length} Categories</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
                        <Trash2 className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Selected For Cleanup</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-0.5">
                            {selectedCategories.length} <span className="text-sm font-bold text-slate-400">({selectedRecordsCount} records)</span>
                        </h3>
                    </div>
                </div>
            </div>

            {/* DANGER ZONE: Full Database Wipe Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-500/5 via-white to-rose-500/10 rounded-[2.5rem] border-2 border-rose-200/80 p-8 lg:p-10 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <AlertTriangle className="w-3.5 h-3.5" /> High Impact Action
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Clear Entire Database</h2>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed">
                            Permanently removes all students, instructors, parents, course catalogs, lessons, submissions, payments, blogs, and communications.
                            <strong className="text-slate-900"> Admin login accounts and essential database schemas will remain intact.</strong>
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setWipeConfirmText('');
                            setIsWipeModalOpen(true);
                        }}
                        className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-lg shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2.5 shrink-0"
                    >
                        <Trash2 className="w-5 h-5" />
                        Clear Whole Database
                    </button>
                </div>
            </div>

            {/* Filtered Data Purge Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 lg:p-10 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Filter & Select Data to Clear</h2>
                        <p className="text-sm font-bold text-slate-400 mt-0.5">
                            Choose specific categories you wish to clear while keeping other records intact.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs w-56 focus:bg-white focus:border-primary/30 outline-none transition-all"
                            />
                        </div>

                        {/* Quick Selection Buttons */}
                        <button
                            onClick={handleSelectAll}
                            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 font-black text-xs uppercase tracking-wider transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            onClick={handleDeselectAll}
                            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 font-black text-xs uppercase tracking-wider transition-colors"
                        >
                            Deselect All
                        </button>

                        {/* Trigger Delete Selected */}
                        <button
                            disabled={selectedCategories.length === 0}
                            onClick={() => {
                                setSelectiveConsentChecked(false);
                                setIsSelectiveModalOpen(true);
                            }}
                            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-600/10 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear Selected ({selectedCategories.length})
                        </button>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredCategories.length === 0 ? (
                        <div className="col-span-full py-16 text-center">
                            <Database className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">No data categories match your search.</p>
                        </div>
                    ) : (
                        filteredCategories.map((category) => {
                            const isSelected = selectedCategories.includes(category.id);
                            const IconComponent = ICON_MAP[category.icon] || Database;
                            const colors = COLOR_CLASSES[category.color] || COLOR_CLASSES.blue;

                            return (
                                <div
                                    key={category.id}
                                    onClick={() => toggleCategory(category.id)}
                                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer select-none group flex flex-col justify-between ${
                                        isSelected
                                            ? 'bg-slate-50/80 border-primary shadow-md shadow-primary/5'
                                            : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-3.5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors.bg} ${colors.text} transition-transform group-hover:scale-105`}>
                                                <IconComponent className="w-6 h-6" />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colors.badge}`}>
                                                    {category.count.toLocaleString()} records
                                                </span>
                                                <div
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                                        isSelected
                                                            ? 'bg-primary border-primary text-white'
                                                            : 'border-slate-300 bg-white group-hover:border-slate-400'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="font-black text-slate-800 text-base group-hover:text-primary transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
                                            {category.description}
                                        </p>
                                    </div>

                                    {/* Sub-counts breakdown */}
                                    {category.subCounts && Object.keys(category.subCounts).length > 1 && (
                                        <div className="mt-4 pt-3.5 border-t border-slate-100/80 flex flex-wrap gap-2">
                                            {Object.entries(category.subCounts).map(([key, val]) => (
                                                <span key={key} className="text-[10px] font-bold text-slate-400 capitalize">
                                                    {key}: <strong className="text-slate-700">{val}</strong>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* MODAL 1: Full Wipe Confirmation Modal */}
            <AnimatePresence>
                {isWipeModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsWipeModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-rose-100 overflow-hidden z-10 p-8 lg:p-10"
                        >
                            <button
                                onClick={() => setIsWipeModalOpen(false)}
                                disabled={clearDataMutation.isPending}
                                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-rose-50 border-2 border-rose-100 rounded-3xl flex items-center justify-center text-rose-600 mb-6">
                                    <ShieldAlert className="w-8 h-8" />
                                </div>

                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                    Reset Whole Database?
                                </h3>
                                <p className="text-slate-500 font-semibold text-sm mt-2 leading-relaxed">
                                    This action is <strong className="text-rose-600">permanent and irreversible</strong>. All students, teachers, parents, courses, submissions, payments, blogs, and communications will be wiped immediately.
                                </p>

                                <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-1.5 text-xs font-bold text-slate-600">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Preserves {adminsCount} Administrator login accounts</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-rose-700">
                                        <Trash2 className="w-4 h-4 text-rose-600" />
                                        <span>Purges {totalRecords.toLocaleString()} platform records</span>
                                    </div>
                                </div>

                                <div className="mt-6 text-left">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                        Type <span className="text-rose-600 font-mono">CLEAR DATABASE</span> to confirm:
                                    </label>
                                    <input
                                        type="text"
                                        value={wipeConfirmText}
                                        onChange={(e) => setWipeConfirmText(e.target.value)}
                                        placeholder="CLEAR DATABASE"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-rose-500 rounded-2xl font-mono text-sm font-bold outline-none transition-colors"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 mt-8">
                                    <button
                                        onClick={handleWipeAll}
                                        disabled={wipeConfirmText !== 'CLEAR DATABASE' || clearDataMutation.isPending}
                                        className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {clearDataMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Wiping Database...</span>
                                            </>
                                        ) : (
                                            'Confirm & Reset Entire Database'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsWipeModalOpen(false)}
                                        disabled={clearDataMutation.isPending}
                                        className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 2: Selective Clear Confirmation Modal */}
            <AnimatePresence>
                {isSelectiveModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSelectiveModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-10 p-8 lg:p-10"
                        >
                            <button
                                onClick={() => setIsSelectiveModalOpen(false)}
                                disabled={clearDataMutation.isPending}
                                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div>
                                <div className="w-14 h-14 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-5">
                                    <Trash2 className="w-7 h-7" />
                                </div>

                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                    Confirm Selective Cleanup
                                </h3>
                                <p className="text-slate-500 font-semibold text-sm mt-1">
                                    You are about to delete records from <strong className="text-slate-800">{selectedCategories.length} selected modules</strong> ({selectedRecordsCount.toLocaleString()} records total).
                                </p>

                                {/* List of selected categories */}
                                <div className="mt-5 max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    {categories
                                        .filter(c => selectedCategories.includes(c.id))
                                        .map(cat => (
                                            <div key={cat.id} className="flex items-center justify-between text-xs font-bold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100">
                                                <span>{cat.name}</span>
                                                <span className="text-rose-600 font-black">{cat.count.toLocaleString()} records</span>
                                            </div>
                                        ))}
                                </div>

                                <label className="flex items-start gap-3 mt-6 p-4 bg-rose-50/60 rounded-2xl border border-rose-100 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={selectiveConsentChecked}
                                        onChange={(e) => setSelectiveConsentChecked(e.target.checked)}
                                        className="w-5 h-5 text-rose-600 rounded-lg border-rose-300 focus:ring-rose-500 mt-0.5"
                                    />
                                    <span className="text-xs font-bold text-rose-900">
                                        I understand that data in the selected categories will be permanently deleted and cannot be recovered.
                                    </span>
                                </label>

                                <div className="flex flex-col gap-3 mt-8">
                                    <button
                                        onClick={handleSelectiveClear}
                                        disabled={!selectiveConsentChecked || clearDataMutation.isPending}
                                        className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {clearDataMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Clearing Data...</span>
                                            </>
                                        ) : (
                                            `Delete Selected Data (${selectedCategories.length} Categories)`
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsSelectiveModalOpen(false)}
                                        disabled={clearDataMutation.isPending}
                                        className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageData;
