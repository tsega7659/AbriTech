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
    Loader2,
    FileText,
    School
} from 'lucide-react';
import { useInstructor } from '../../context/InstructorContext';

const InstructorStudentDetail = () => {
    const { courseId, studentId } = useParams();
    const navigate = useNavigate();
    const { fetchStudentCourseDetail } = useInstructor();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const detail = await fetchStudentCourseDetail(studentId, courseId);
            setData(detail);
            setLoading(false);
        };
        loadData();
    }, [courseId, studentId, fetchStudentCourseDetail]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-10 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <h2 className="text-xl font-bold text-slate-800">Student not found</h2>
                <button onClick={() => navigate(-1)} className="text-primary font-bold">Go Back</button>
            </div>
        );
    }

    const { student, submissions } = data;

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="space-y-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Student List
                </button>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-8">
                    <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary font-black text-3xl">
                        {student.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-2">
                        <h1 className="text-3xl font-bold text-slate-800">{student.fullName}</h1>
                        <div className="flex flex-wrap items-center gap-6">
                            <span className="flex items-center gap-2 text-slate-500 font-medium italic">
                                <Mail className="w-4 h-4" />
                                {student.email}
                            </span>
                            <span className="flex items-center gap-2 text-slate-500 font-medium italic">
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
                    {/* Course Progress Card */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Course Progress</h3>
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-4 text-center">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="10"
                                        fill="transparent"
                                        className="text-slate-100"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="10"
                                        fill="transparent"
                                        strokeDasharray={364.42}
                                        strokeDashoffset={364.42 * (1 - student.progressPercentage / 100)}
                                        className="text-primary transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <span className="absolute text-2xl font-black text-slate-800">{Math.round(student.progressPercentage)}%</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50 space-y-3">
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-slate-400">Status</span>
                                <span className={`uppercase tracking-widest text-[10px] px-2 py-1 rounded-lg ${student.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                    {student.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-slate-400">Enrolled At</span>
                                <span className="text-slate-600 italic font-medium">{new Date(student.enrolledAt).toLocaleDateString()}</span>
                            </div>
                        </div>
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
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
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
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg">{sub.assignmentTitle}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    sub.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {sub.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> :
                                                    sub.status === 'pending' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                {sub.status}
                                            </span>
                                        </div>

                                        <div className="p-4 bg-white rounded-xl border border-slate-100 text-sm font-medium text-slate-600">
                                            {sub.submissionType === 'link' ? (
                                                <a href={sub.submissionContent} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline italic">
                                                    <ExternalLink className="w-4 h-4" />
                                                    View Submission Link
                                                </a>
                                            ) : (
                                                <p className="whitespace-pre-wrap italic">{sub.submissionContent}</p>
                                            )}
                                        </div>

                                        {sub.feedback && (
                                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Feedback from Instructor</p>
                                                <p className="text-sm font-medium text-slate-700 italic">{sub.feedback}</p>
                                            </div>
                                        )}

                                        {sub.status === 'pending' && (
                                            <div className="flex items-center gap-3 pt-2">
                                                <button className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">Review Now</button>
                                                <button className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Reject</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorStudentDetail;
