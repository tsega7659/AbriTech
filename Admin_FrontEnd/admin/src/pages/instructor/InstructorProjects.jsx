import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Search, ExternalLink, MessageCircle, FileText } from 'lucide-react';
import api from '../../lib/api.js';
import Loading from '../../components/Loading';
import FeedbackModal from '../../components/FeedbackModal';

const InstructorProjects = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState("");
    const [assessing, setAssessing] = useState(null); // ID of submission being assessed
    const [assessmentData, setAssessmentData] = useState({ result: 'pass', feedback: '' });
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const fetchSubmissions = async () => {
        try {
            const response = await api.get('/teachers/submissions');
            setSubmissions(response.data);
        } catch (error) {
            console.error('Failed to fetch submissions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleAssess = async (e) => {
        e.preventDefault();
        if (!assessing) return;

        try {
            await api.post(`/assignments/submissions/${assessing}/assess`, {
                status: assessmentData.status,
                result: assessmentData.result,
                feedback: assessmentData.feedback
            });
            setAssessing(null);
            showFeedback("Success", "Assessment saved successfully!", "success");
            fetchSubmissions();
        } catch (error) {
            console.error('Assessment failed', error);
            showFeedback("Error", "Failed to save assessment", "error");
        }
    };

    const stats = [
        { label: 'Pending Review', value: submissions.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Approved', value: submissions.filter(s => s.status === 'approved').length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Rejected', value: submissions.filter(s => s.status === 'rejected').length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    ];

    const filtered = submissions.filter(s =>
        s.status === activeTab &&
        (s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <Loading fullScreen={false} message="Loading project submissions..." />;

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Project Reviews</h1>
                    <p className="text-slate-500 font-medium mt-1">Grade and provide feedback on student work</p>
                </div>

                <div className="relative max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search student or project..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:border-primary focus:outline-none shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">{stat.value}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100/50 p-1.5 rounded-2xl w-fit">
                {['pending', 'approved', 'rejected'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {tab} ({submissions.filter(s => s.status === tab).length})
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-16 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No submissions found</h3>
                        <p className="text-slate-400 mt-1">Try switching tabs or adjusting your search.</p>
                    </div>
                ) : (
                    filtered.map((sub) => (
                        <div key={sub.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-8">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{sub.courseName}</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800">{sub.assignmentTitle}</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 overflow-hidden">
                                                {sub.studentName.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-slate-600">{sub.studentName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {sub.submissionType === 'file' ? (
                                            <a
                                                href={sub.submissionContent}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest transition-colors"
                                            >
                                                View File <ExternalLink className="w-4 h-4" />
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => showFeedback("Project Content", sub.submissionContent, "info")}
                                                className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest transition-colors"
                                            >
                                                Read Text <MessageCircle className="w-4 h-4" />
                                            </button>
                                        )}

                                        {sub.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    setAssessing(sub.id);
                                                    setAssessmentData({ status: 'approved', result: 'pass', feedback: '' });
                                                }}
                                                className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                            >
                                                Start Assessment
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {assessing === sub.id && (
                                    <div className="mt-8 pt-8 border-t border-slate-50 animate-in slide-in-from-top-4 duration-300">
                                        <form onSubmit={handleAssess} className="space-y-6 max-w-2xl">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Status</label>
                                                    <select
                                                        value={assessmentData.status}
                                                        onChange={(e) => setAssessmentData({ ...assessmentData, status: e.target.value })}
                                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:outline-none"
                                                    >
                                                        <option value="approved">Approve</option>
                                                        <option value="rejected">Reject</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Grade</label>
                                                    <select
                                                        value={assessmentData.result}
                                                        onChange={(e) => setAssessmentData({ ...assessmentData, result: e.target.value })}
                                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:outline-none"
                                                    >
                                                        <option value="pass">Pass</option>
                                                        <option value="fail">Fail</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback Message</label>
                                                <textarea
                                                    value={assessmentData.feedback}
                                                    onChange={(e) => setAssessmentData({ ...assessmentData, feedback: e.target.value })}
                                                    placeholder="Great work! The presentation was clear..."
                                                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm min-h-[120px] focus:outline-none focus:bg-white focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <button type="submit" className="px-8 py-3 bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all">
                                                    Save Assessment
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAssessing(null)}
                                                    className="px-8 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {(sub.status === 'approved' || sub.status === 'rejected') && sub.feedback && (
                                    <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                                        <div className="shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-300">
                                            <MessageCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Feedback Given</p>
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{sub.feedback}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
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

export default InstructorProjects;
