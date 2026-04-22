import { Users, BookOpen, Trophy, TrendingUp, Lightbulb, Clock, CheckCircle2, AlertCircle, XCircle, ChevronRight, BarChart3, Target, Zap } from "lucide-react";
import React, { useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import LinkStudentForm from "../../components/LinkStudentForm";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useParentDashboardStats, useLinkedStudents, useDetailedProgress } from "../../hooks/useParentQueries";
import Loading from "../../components/Loading";

const DetailedProgressModal = ({ isOpen, onClose, studentId, courseId, courseName, studentName }) => {
    const { data: progress, isLoading } = useDetailedProgress(studentId, courseId);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                    onClick={onClose} 
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-blue-50 text-[#00B4D8] rounded text-[10px] font-black uppercase tracking-widest ring-1 ring-blue-500/10">
                                    Learning Analysis
                                </span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                                {courseName}
                            </h3>
                            <p className="text-gray-500 font-bold text-xs">
                                Global progress for <span className="text-[#00B4D8]">{studentName}</span>
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2.5 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl border border-gray-100 transition-all active:scale-95 shadow-sm">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8">
                        {isLoading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-400">
                                <Loading fullScreen={false} message="Analyzing learning data..." />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Stats Overview */}
                                <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#00B4D8] shadow-sm mb-3">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-2xl font-black text-gray-900 leading-none mb-1">{progress?.overview?.progressPercentage}%</h4>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest uppercase">Course Progress</p>
                                    </div>
                                    <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100 flex flex-col items-center text-center">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-500 shadow-sm mb-3">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-2xl font-black text-gray-900 leading-none mb-1">
                                            {Math.floor((progress?.overview?.timeSpentSeconds || 0) / 3600)}h {Math.floor(((progress?.overview?.timeSpentSeconds || 0) % 3600) / 60)}m
                                        </h4>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Time Invested</p>
                                    </div>
                                    <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm mb-3">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-2xl font-black text-gray-900 leading-none mb-1">{progress?.quizzes?.length || 0}</h4>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Quizzes Taken</p>
                                    </div>
                                    <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 flex flex-col items-center text-center">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm mb-3">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-2xl font-black text-gray-900 leading-none mb-1">{progress?.projects?.length || 0}</h4>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Projects Filed</p>
                                    </div>
                                </div>

                                {/* Quizzes Section */}
                                <div className="lg:col-span-12 space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-[#00B4D8]" /> Quiz Assessment History
                                    </h4>
                                    <div className="space-y-3">
                                        {progress?.quizzes?.length > 0 ? progress.quizzes.map((quiz, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-xs", quiz.isCorrect ? "bg-emerald-500" : "bg-rose-500")}>
                                                        {quiz.isCorrect ? "✓" : "✗"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{quiz.lessonTitle}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px] sm:max-w-md">{quiz.question}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md", quiz.result === 'pass' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                                        {quiz.result || (quiz.isCorrect ? 'SUCCESS' : 'FAILED')}
                                                    </span>
                                                    <p className="text-[9px] font-bold text-gray-300 mt-1 uppercase">{new Date(quiz.attemptedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No quiz attempts recorded</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Projects Section */}
                                <div className="lg:col-span-12 space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-purple-500" /> Project Milestones
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {progress?.projects?.length > 0 ? progress.projects.map((project, i) => (
                                            <div key={i} className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-purple-100 transition-all shadow-sm group">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h5 className="font-black text-gray-900 tracking-tight">{project.title}</h5>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-tighter">Submitted {new Date(project.submittedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest", 
                                                        project.status === 'approved' ? "bg-emerald-50 text-emerald-600" : 
                                                        project.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600")}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-4 leading-relaxed">{project.description}</p>
                                                {project.score !== null && (
                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase uppercase">Grade Awarded</span>
                                                        <span className="text-sm font-black text-purple-600">{project.score}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="col-span-2 py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Projects submitted for this child</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                        <button onClick={onClose} className="px-8 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                            Close Analytics
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default function ParentDashboard() {
    const { user } = useAuth();
    const { data: dashboardData, isLoading: statsLoading } = useParentDashboardStats();
    const { data: linkedStudents = [], isLoading: studentsLoading } = useLinkedStudents();

    const [modalConfig, setModalConfig] = useState({ 
        isOpen: false, 
        studentId: null, 
        courseId: null, 
        courseName: '', 
        studentName: '' 
    });

    const openProgressModal = (student, course) => {
        setModalConfig({
            isOpen: true,
            studentId: student.id,
            courseId: course.id,
            courseName: course.name,
            studentName: student.fullName
        });
    };

    const loading = statsLoading || studentsLoading;


    if (loading) {
        return <Loading fullScreen={false} message="Loading your dashboard..." />;
    }

    const stats = [
        { label: "Children", value: dashboardData?.linkedStudents || "0", icon: Users, color: "text-[#00B4D8]", bg: "bg-blue-50" },
        { label: "Course Enrollments", value: dashboardData?.totalCourseEnrollments || "0", icon: BookOpen, color: "text-[#FDB813]", bg: "bg-[#FDB813]/10" },
        { label: "Lessons Completed", value: dashboardData?.totalLessonsCompleted || "0", icon: Trophy, color: "text-[#FDB813]", bg: "bg-yellow-50" },
        { label: "Avg Quiz Score", value: (dashboardData?.averageQuizScore !== undefined && dashboardData?.averageQuizScore !== null) ? `${dashboardData.averageQuizScore}%` : "0%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-4">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="max-w-lg">
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                        Parent <span className="text-[#00B4D8]">Portal</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm leading-relaxed">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'User'}.
                    </p>
                </div>
                <div className="w-full xl:w-[350px]">
                    <LinkStudentForm />
                </div>
            </header>

            {/* Monthly Recognition Alert */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center md:items-start relative overflow-hidden group max-w-4xl"
            >
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Trophy className="w-24 h-24 text-[#FDB813]" />
                </div>
                <div className="bg-white p-2.5 rounded-xl text-[#FDB813] shadow-md shadow-yellow-200/50 flex-shrink-0 z-10">
                    <Trophy className="h-6 w-6" />
                </div>
                <div className="text-center md:text-left z-10">
                    <h3 className="text-[#FDB813] text-sm font-black mb-1 uppercase tracking-widest">Monthly Recognition</h3>
                    <p className="text-yellow-900/80 text-sm leading-snug font-medium mb-2 italic max-w-2xl">
                        "Dear {user?.fullName || 'Valued Parent'}, thank you for your unwavering commitment to quality education. Your dedication to your children's learning journey is transforming their future."
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <div className="h-px w-4 bg-yellow-300"></div>
                        <p className="text-[10px] text-yellow-600 font-black uppercase tracking-tighter">The AbriTech Team</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards - Children */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:rotate-12", stat.bg, stat.color)}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-0.5">{stat.value}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Linked Students Section */}
            {linkedStudents.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Linked Students</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {linkedStudents.map((student, i) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{student.fullName}</h3>
                                        <p className="text-sm text-gray-500">{student.schoolName || 'Not specified'}</p>
                                        <p className="text-xs text-gray-400">{student.classLevel || 'N/A'}</p>
                                    </div>
                                    <div className="bg-blue-50 px-3 py-1 rounded-full flex-shrink-0">
                                        <p className="text-xs font-bold text-[#00B4D8]">{student.enrolledCount || 0} Courses</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Enrolled Courses & Intensity</p>
                                            {student.enrolledCourses.map((course, idx) => (
                                                <div key={idx} className="p-4 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] group hover:border-[#00B4D8]/30 transition-all shadow-sm">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#00B4D8] font-black text-xs shadow-sm ring-1 ring-gray-100 group-hover:scale-110 transition-transform">
                                                                {course.name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-gray-800 tracking-tight">{course.name}</p>
                                                                <p className="text-[9px] font-bold text-[#00B4D8] flex items-center gap-1 uppercase">
                                                                    <Clock className="w-3 h-3" />
                                                                    {Math.floor((course.timeSpentSeconds || 0) / 3600)}h {Math.floor(((course.timeSpentSeconds || 0) % 3600) / 60)}m invested
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => openProgressModal(student, course)}
                                                            className="p-2 bg-white text-gray-400 hover:text-[#00B4D8] hover:bg-[#00B4D8]/5 rounded-lg border border-gray-100 active:scale-95 transition-all shadow-sm group/btn flex items-center gap-1.5"
                                                        >
                                                            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Details</span>
                                                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="text-gray-400 font-bold uppercase tracking-wider">Progress</span>
                                                            <span className="font-black text-[#00B4D8]">{Math.round(course.progressPercentage || 0)}%</span>
                                                        </div>
                                                        <div className="w-full h-1 bg-white rounded-full overflow-hidden ring-1 ring-gray-100">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${course.progressPercentage || 0}%` }}
                                                                className="h-full bg-gradient-to-r from-[#00B4D8] to-[#48CAE4] rounded-full shadow-[0_0_8px_rgba(0,180,216,0.3)]"
                                                            ></motion.div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No active enrollments for {student.fullName}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}
 
            {/* Detailed Progress Modal */}
            <DetailedProgressModal 
                {...modalConfig}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
            />

            {/* Tip Card */}
            <div className="bg-[#00B4D8] rounded-xl p-4 md:p-5 text-white flex flex-col md:flex-row gap-4 items-center shadow-md">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md flex-shrink-0">
                    <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-lg font-black mb-1 tracking-tight">Expert Parenting Tip</h3>
                    <p className="text-blue-50 text-sm leading-snug font-medium opacity-90">
                        Balance digital learning with 5-minute movement breaks every hour to protect vision and health.
                    </p>
                </div>
            </div>
        </div >
    );
}
