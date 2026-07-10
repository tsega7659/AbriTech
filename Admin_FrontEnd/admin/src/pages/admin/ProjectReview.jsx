import React, { useState } from 'react';
import {
    CheckSquare,
    Clock,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Search,
    Filter,
    Eye,
    MessageCircle,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { useProjects, useReviewProject } from '../../hooks/useAdminQueries';
import Loading from '../../components/Loading';
import FeedbackModal from '../../components/FeedbackModal';

const ProjectReview = () => {
    const { data: projects = [], isLoading: loading, error } = useProjects();
    const reviewMutation = useReviewProject();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [reviewingProject, setReviewingProject] = useState(null);
    const [reviewForm, setReviewForm] = useState({ status: 'approved', score: '', feedback: '' });
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const stats = [
        { label: 'Total Pending', count: projects.filter(p => p.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Approved', count: projects.filter(p => p.status === 'approved').length, icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/5' },
        { label: 'Redo Requested', count: projects.filter(p => p.status === 'redo').length, icon: RefreshCw, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Rejected', count: projects.filter(p => p.status === 'rejected').length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewingProject) return;

        reviewMutation.mutate({
            id: reviewingProject.id,
            assessmentData: reviewForm
        }, {
            onSuccess: () => {
                setReviewingProject(null);
                setFeedbackModal({
                    isOpen: true,
                    title: 'Success',
                    message: 'Project reviewed successfully',
                    type: 'success'
                });
            },
            onError: (err) => {
                setFeedbackModal({
                    isOpen: true,
                    title: 'Error',
                    message: err.response?.data?.message || 'Failed to review project',
                    type: 'error'
                });
            }
        });
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));

    if (loading) return <Loading fullScreen={false} message="Loading student projects..." />;

    if (error) return (
        <div className="p-10 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Failed to load projects</h2>
            <p className="text-slate-500">{error.message}</p>
        </div>
    );

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2 text-slate-900 tracking-tight">Project Review & Approval</h1>
                <p className="text-slate-500 font-medium">Review student submissions, provide feedback, and manage project approvals.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white px-6 py-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.count}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search projects or students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'pending', 'approved', 'redo', 'rejected'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all border ${statusFilter === s
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student & Project</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Course</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Submitted</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium">
                                        No projects found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((proj) => (
                                    <tr key={proj.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-black text-slate-800 group-hover:text-primary transition-colors text-base">{proj.title}</p>
                                                <p className="text-sm text-slate-400 font-bold tracking-tight">{proj.studentName}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                                                {proj.courseName || 'General Project'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-500 font-semibold">
                                            {new Date(proj.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${proj.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                proj.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    proj.status === 'redo' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {proj.status === 'redo' ? 'Redo' : proj.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {(proj.image || proj.githubLink) && (
                                                    <a
                                                        href={proj.githubLink || proj.image}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                        title="View Source"
                                                    >
                                                        <ExternalLink className="w-5 h-5" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setReviewingProject(proj);
                                                        setReviewForm({
                                                            status: proj.status === 'pending' ? 'approved' : proj.status,
                                                            score: proj.score || '',
                                                            feedback: proj.feedback || ''
                                                        });
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                    title="Review"
                                                >
                                                    <CheckSquare className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Showing {filteredProjects.length > 0 ? indexOfFirstItem + 1 : 0}–{Math.min(indexOfLastItem, filteredProjects.length)} of {filteredProjects.length} submissions
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

            {/* Review Modal */}
            {reviewingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Review Submission</h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{reviewingProject.title}</p>
                                </div>
                                <button onClick={() => setReviewingProject(null)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 transition-all">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleReviewSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Status</label>
                                        <select
                                            value={reviewForm.status}
                                            onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-50 rounded-2xl font-bold text-sm focus:bg-white focus:border-primary focus:outline-none transition-all"
                                        >
                                            <option value="approved">Approve</option>
                                            <option value="redo">Request Redo</option>
                                            <option value="rejected">Reject</option>
                                            <option value="pending">Keep Pending</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Score (0-100)</label>
                                        <input
                                            type="number"
                                            value={reviewForm.score}
                                            onChange={(e) => setReviewForm({ ...reviewForm, score: e.target.value })}
                                            placeholder="85"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-50 rounded-2xl font-bold text-sm focus:bg-white focus:border-primary focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Feedback</label>
                                    <textarea
                                        value={reviewForm.feedback}
                                        onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                                        rows="4"
                                        placeholder="Provide detailed feedback for the student..."
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-50 rounded-[2rem] font-medium text-sm focus:bg-white focus:border-primary focus:outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={reviewMutation.isPending}
                                        className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {reviewMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save Review
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

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

export default ProjectReview;
