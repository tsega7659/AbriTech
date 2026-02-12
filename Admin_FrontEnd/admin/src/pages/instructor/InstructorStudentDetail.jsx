import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Calendar,
    TrendingUp,
    CheckCircle2,
    ExternalLink,
    Clock,
    AlertCircle,
    FileText,
    School,
    Award
} from 'lucide-react';
import { useInstructor } from '../../context/InstructorContext';
import Loading from '../../components/Loading';
import api from '../../lib/api.js';
import FeedbackModal from '../../components/FeedbackModal';

const InstructorStudentDetail = () => {
    const { courseId, studentId } = useParams();
    const navigate = useNavigate();
    const { fetchStudentCourseDetail } = useInstructor();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [assessing, setAssessing] = useState(null);
    const [assessmentData, setAssessmentData] = useState({ status: 'approved', result: 'pass', feedback: '' });
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const loadData = async () => {
        setLoading(true);
        const detail = await fetchStudentCourseDetail(studentId, courseId);
        setData(detail);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [courseId, studentId, fetchStudentCourseDetail]);

    const handleAssess = async (e) => {
        e.preventDefault();
        if (!assessing) return;

        try {
            await api.post(`/assignments/submissions/${assessing}/assess`, {
                status: assessmentData.status,
                result: assessmentData.score >= (assessmentData.maxScore / 2) ? 'pass' : 'fail',
                score: assessmentData.score,
                maxScore: assessmentData.maxScore,
                feedback: assessmentData.feedback
            });
            showFeedback("Success", "Assessment saved successfully!", "success");
            setAssessing(null);
            loadData();
        } catch (error) {
            console.error('Assessment failed', error);
            showFeedback("Error", "Failed to save assessment", "error");
        }
    };

    if (loading) return <Loading fullScreen={false} message="Loading student details..." />;

    if (!data) return (
        <div className="p-10 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Student not found</h2>
            <button onClick={() => navigate(-1)} className="text-primary font-bold">Go Back</button>
        </div>
    );

    const { student, submissions, quizzes } = data;

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="space-y-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary font-black text-xs uppercase tracking-widest transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Student List
                </button>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-8">
                    <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary font-black text-3xl">
                        {student.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-2">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{student.fullName}</h1>
                        <div className="flex flex-wrap items-center gap-6">
                            <span className="flex items-center gap-2 text-slate-500 font-bold text-xs italic">
                                <Mail className="w-4 h-4" />
                                {student.email}
                            </span>
                            <span className="flex items-center gap-2 text-slate-500 font-bold text-xs italic">
                                <School className="w-4 h-4" />
                                {student.schoolName || 'N/A'} - {student.classLevel || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Stats & Info */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                        <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest">Course Progress</h3>
                        <div className="space-y-4 text-center">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                                    <circle
                                        cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent"
                                        strokeDasharray={364.42}
                                        strokeDashoffset={364.42 * (1 - (student.progressPercentage || 0) / 100)}
                                        className="text-primary transition-all duration-1000 ease-out shadow-sm"
                                    />
                                </svg>
                                <span className="absolute text-2xl font-black text-slate-800">{Math.round(student.progressPercentage || 0)}%</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50 space-y-3">
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-slate-400">Status</span>
                                <span className={`uppercase tracking-widest text-[10px] px-2 py-1 rounded-lg ${student.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                    {student.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Scores Table */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" /> Quiz Scores
                            </h3>
                        </div>
                        {quizzes && quizzes.length > 0 ? (
                            <div className="space-y-4">
                                {quizzes.map((q, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800">{q.lessonTitle}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(q.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black ${q.score >= 70 ? 'text-green-500' : q.score >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>{q.score}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-400 italic text-sm py-4">No quizzes attempted yet.</p>
                        )}
                    </div>
                </div>

                {/* Right Side: Project Submissions */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm min-h-[500px]">
                        <div className="flex items-center gap-3 mb-8">
                            <FileText className="w-6 h-6 text-primary" />
                            <h3 className="text-xl font-bold text-slate-800">Project Submissions</h3>
                        </div>

                        {submissions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <p className="font-bold">No projects submitted yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {submissions.map((sub) => (
                                    <div key={sub.id} className="p-6 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all space-y-4 bg-slate-50/30">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-slate-800 text-lg">{sub.assignmentTitle}</h4>
                                                    {sub.score !== null && (
                                                        <span className="text-lg font-black text-primary">{sub.score}/{sub.maxScore}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest h-fit ${sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                sub.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {sub.status}
                                            </span>
                                        </div>

                                        <div className="p-4 bg-white rounded-xl border border-slate-100 text-sm font-medium text-slate-600">
                                            {sub.submissionType === 'file' ? (
                                                <a href={sub.submissionContent} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline italic font-bold">
                                                    <ExternalLink className="w-4 h-4" /> View File Submission
                                                </a>
                                            ) : (
                                                <p className="italic whitespace-pre-wrap">"{sub.submissionContent}"</p>
                                            )}
                                        </div>

                                        {assessing === sub.id ? (
                                            <form onSubmit={handleAssess} className="mt-4 p-6 bg-white rounded-2xl border border-slate-100 space-y-6 animate-in slide-in-from-top-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                                                        <select
                                                            value={assessmentData.status}
                                                            onChange={(e) => setAssessmentData({ ...assessmentData, status: e.target.value })}
                                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs uppercase tracking-widest focus:outline-none"
                                                        >
                                                            <option value="approved">Approve</option>
                                                            <option value="rejected">Reject</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</label>
                                                        <input
                                                            type="number"
                                                            value={assessmentData.score || ''}
                                                            onChange={(e) => setAssessmentData({ ...assessmentData, score: e.target.value })}
                                                            placeholder="Grade"
                                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:outline-none"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Mark</label>
                                                        <input
                                                            type="number"
                                                            value={assessmentData.maxScore || 10}
                                                            onChange={(e) => setAssessmentData({ ...assessmentData, maxScore: e.target.value })}
                                                            placeholder="Out of"
                                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:outline-none"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback</label>
                                                    <textarea
                                                        value={assessmentData.feedback}
                                                        onChange={(e) => setAssessmentData({ ...assessmentData, feedback: e.target.value })}
                                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-medium text-sm focus:outline-none min-h-[100px]"
                                                        placeholder="Add comments..."
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="submit" className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all">Save Changes</button>
                                                    <button type="button" onClick={() => setAssessing(null)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                                                </div>
                                            </form>
                                        ) : sub.status === 'pending' ? (
                                            <button
                                                onClick={() => {
                                                    setAssessing(sub.id);
                                                    setAssessmentData({
                                                        status: sub.status || 'approved',
                                                        score: sub.score,
                                                        maxScore: sub.maxScore || 10,
                                                        feedback: sub.feedback || ''
                                                    });
                                                }}
                                                className="w-full py-4 bg-primary text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                Assess This Project
                                            </button>
                                        ) : sub.feedback && (
                                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Feedback Given</p>
                                                    {sub.score !== null && <span className="text-[10px] font-black text-primary">{sub.score}/{sub.maxScore}</span>}
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 italic">"{sub.feedback}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
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

export default InstructorStudentDetail;
