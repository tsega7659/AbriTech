import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Clock,
    Download,
    Filter,
    Search,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    Smartphone,
    MoreHorizontal,
    Loader2,
    RefreshCw
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import apiClient from '../../lib/apiClient';
import Loading from '../../components/Loading';

const StatusBadge = ({ status }) => {
    const map = {
        success: { label: 'Completed', cls: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
        pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
        failed: { label: 'Failed', cls: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
        verified: { label: 'Verified', cls: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
    };
    const s = map[status] || map.pending;
    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${s.cls}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </div>
    );
};

const ITEMS_PER_PAGE = 6;

const Payments = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/admin/payments');
            setData(res.data);
        } catch (err) {
            console.error('Failed to load payments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayments(); }, []);

    // Reset page on filter change
    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    if (loading) return <Loading fullScreen={false} message="Loading payment data..." />;

    const transactions = data?.payments || [];
    const stats = data?.stats || {};

    const filtered = transactions.filter(txn => {
        const matchSearch = (
            txn.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.txRef?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchStatus = statusFilter === 'all' || txn.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const statCards = [
        { label: 'Total Revenue', value: `${Number(stats.totalRevenue || 0).toLocaleString()} ETB`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Weekly Revenue', value: `${Number(stats.weeklyRevenue || 0).toLocaleString()} ETB`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Pending Deposits', value: `${Number(stats.pendingAmount || 0).toLocaleString()} ETB`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Success Rate', value: `${stats.successRate || 0}%`, icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Financial Overview</h1>
                    <p className="text-slate-500 font-bold text-sm mt-1">
                        Track your revenue and course enrollments &mdash;&nbsp;
                        <span className="text-primary">{transactions.length} transactions total</span>
                    </p>
                </div>
                <button
                    onClick={fetchPayments}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-800">All Transactions</h3>
                        <p className="text-sm font-bold text-slate-400">Live payment records from database</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Status filter */}
                        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                            {['all', 'success', 'pending', 'failed'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by student, course, or ref..."
                                className="pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-primary/20 outline-none font-bold text-sm w-full md:w-72 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">#</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Student</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Course</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Method</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center">
                                        <DollarSign className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No transactions found</p>
                                    </td>
                                </tr>
                            ) : currentItems.map((txn) => (
                                <tr key={txn.id} className="group hover:bg-slate-50/30 transition-all">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg truncate max-w-[100px] block">
                                            {txn.txRef ? `#${txn.txRef.slice(-8)}` : `#${txn.id}`}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 overflow-hidden shrink-0">
                                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(txn.studentName || '?')}&background=random&color=fff`} alt="" />
                                            </div>
                                            <span className="text-sm font-black text-slate-700 whitespace-nowrap">{txn.studentName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-slate-500 line-clamp-1">{txn.courseName}</span>
                                    </td>
                                    <td className="px-8 py-6 font-black text-slate-800 text-sm whitespace-nowrap">
                                        {Number(txn.amount).toLocaleString()} ETB
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <Smartphone className="w-3.5 h-3.5" /> {txn.method || 'Telebirr'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">{new Date(txn.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{new Date(txn.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge status={txn.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-8 border-t border-slate-50 flex items-center justify-between flex-wrap gap-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Showing {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} transactions
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-all border border-transparent hover:border-primary/20"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-all border border-transparent hover:border-primary/20"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
