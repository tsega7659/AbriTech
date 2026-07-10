import React, { useState, useEffect } from 'react';
import {
    Activity,
    Search,
    Filter,
    ChevronRight,
    Clock,
    User,
    Link as LinkIcon,
    Eye,
    X,
    Calendar,
    Tag,
    Info,
    ExternalLink,
    ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../lib/apiClient';
import Loading from '../../components/Loading';

const StatusBadge = ({ type }) => {
    const styles = {
        'Enrollment': 'bg-blue-50 text-blue-700 border-blue-100',
        'Project': 'bg-purple-50 text-purple-700 border-purple-100',
        'Assignment': 'bg-indigo-50 text-indigo-700 border-indigo-100',
        'User Registration': 'bg-green-50 text-green-700 border-green-100',
        'Payment': 'bg-amber-50 text-amber-700 border-amber-100',
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${styles[type] || 'bg-gray-50 text-gray-700 border-gray-100'}`}>
            {type}
        </span>
    );
};

const ActivityDetailModal = ({ activity, onClose }) => {
    if (!activity) return null;

    let details = {};
    try {
        details = typeof activity.details === 'string' ? JSON.parse(activity.details) : (activity.details || {});
    } catch (e) {
        details = { info: activity.details };
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative p-8 pb-0 flex justify-between items-start">
                    <div>
                        <StatusBadge type={activity.type} />
                        <h2 className="text-2xl font-black text-slate-800 mt-4 leading-tight">
                            {activity.action}
                        </h2>
                        <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date(activity.time).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 rounded-xl transition-colors group"
                    >
                        <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shadow-sm">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=4dbfec&color=fff`}
                                alt={activity.user}
                            />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performed By</p>
                            <p className="font-bold text-slate-800">{activity.user}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-3 h-3" /> Event Details
                            </h3>
                            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 divide-y divide-slate-200">
                                {Object.entries(details).length > 0 ? (
                                    Object.entries(details).map(([key, value]) => (
                                        <div key={key} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center group">
                                            <span className="text-xs font-bold text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <span className="text-sm font-black text-slate-700">
                                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 font-bold italic">No additional metadata</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-lg active:scale-95"
                    >
                        Close Detail
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ITEMS_PER_PAGE = 6;

export default function ActivityMonitoring() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/activity-logs');
            setActivities(response.data);
        } catch (error) {
            console.error('Failed to fetch activity logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const types = ['All', 'Enrollment', 'Project', 'Assignment', 'User Registration', 'Payment'];

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.action.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'All' || activity.type === selectedType;
        return matchesSearch && matchesType;
    });

    const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
    const paginatedActivities = filteredActivities.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedType]);

    if (loading) return <Loading fullScreen={false} message="Analyzing system activity..." />;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Monitoring</h1>
                    </div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Real-time platform activity tracking</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search activities..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-72 text-sm font-bold shadow-sm"
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                    >
                        Refresh Logs
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                {types.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${selectedType === type
                            ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200'
                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {paginatedActivities.map((activity, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => setSelectedActivity(activity)}
                                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <StatusBadge type={activity.type} />
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-black uppercase overflow-hidden border border-slate-200 transition-transform group-hover:scale-110">
                                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=random&color=fff`} alt="" />
                                            </div>
                                            <span className="font-bold text-slate-700">{activity.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="font-medium text-slate-600 line-clamp-1">{activity.action}</span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700">{new Date(activity.time).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(activity.time).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right whitespace-nowrap">
                                        <div className="p-2 text-slate-300 group-hover:text-primary transition-all inline-block">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredActivities.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                                            <Activity className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching activities found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-8 border-t border-slate-50 flex items-center justify-between flex-wrap gap-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredActivities.length)} of {filteredActivities.length} logs
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-primary disabled:opacity-30 transition-all border border-transparent hover:border-primary/20"
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
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-primary disabled:opacity-30 transition-all border border-transparent hover:border-primary/20"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedActivity && (
                    <ActivityDetailModal
                        activity={selectedActivity}
                        onClose={() => setSelectedActivity(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
