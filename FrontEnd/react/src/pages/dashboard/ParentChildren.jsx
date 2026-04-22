import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, ChevronRight, ArrowLeft, Trophy, Calendar, Target, Clock, Zap, BarChart3, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import Loading from '../../components/Loading';
import { useLinkedStudents, useDetailedProgress } from '../../hooks/useParentQueries';

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

export default function ParentChildren() {
    const { data: students = [], isLoading: loading } = useLinkedStudents();
    const [selectedStudent, setSelectedStudent] = useState(null);
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

    if (loading) return <Loading />;

    // Detail View
    if (selectedStudent) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header / Back Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedStudent(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">{selectedStudent.fullName}</h1>
                        <p className="text-gray-500 font-medium">Detailed Progress Report</p>
                    </div>
                </div>

                {/* Student Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#00B4D8]">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Courses</p>
                            <p className="text-xl font-black text-gray-900">{selectedStudent.enrolledCount || 0} Enrolled</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Avg. Progress</p>
                            <p className="text-xl font-black text-gray-900">{Math.round(selectedStudent.averageProgress || 0)}% Completed</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">School</p>
                            <p className="text-xl font-black text-gray-900">{selectedStudent.schoolName || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Course List */}
                <h2 className="text-xl font-bold text-gray-900">Enrolled Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedStudent.enrolledCourses && selectedStudent.enrolledCourses.length > 0 ? (
                        selectedStudent.enrolledCourses.map((course, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={course.id || idx}
                                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                                            <img
                                                src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://abritech.onrender.com'}${course.thumbnail}`) : "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=600"}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-[#00B4D8] transition-colors line-clamp-1">{course.name}</h3>
                                            <p className="text-sm text-gray-500">In Progress</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-[#00B4D8]">{course.progress || 0}%</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#00B4D8] rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${course.progress || 0}%` }}
                                    ></div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                    <button 
                                        onClick={() => openProgressModal(selectedStudent, course)}
                                        className="px-4 py-2 bg-blue-50 text-[#00B4D8] hover:bg-[#00B4D8] hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                                    >
                                        View Analytics
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No courses enrolled yet.</p>
                        </div>
                    )}
                </div>

                <DetailedProgressModal 
                    {...modalConfig}
                    onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                />
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">My <span className="text-[#00B4D8]">Children</span></h1>
                <p className="text-gray-500 mt-2 text-lg">Select a child to view their detailed progress and course activity.</p>
            </header>

            {students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student, i) => (
                        <motion.button
                            key={student.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setSelectedStudent(student)}
                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all text-left group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-500">
                                <Users className="w-32 h-32" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-[#00B4D8] mb-6 shadow-inner ring-4 ring-white">
                                    <span className="text-2xl font-black">{student.fullName.charAt(0)}</span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#00B4D8] transition-colors">{student.fullName}</h3>
                                <div className="space-y-1 mb-6">
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        {student.schoolName || 'School Not Set'}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        {student.classLevel || 'Grade Not Set'}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Courses</p>
                                        <p className="text-lg font-black text-gray-900">{student.enrolledCount || 0}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#00B4D8] group-hover:text-white transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Children Linked</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                        Link your children's accounts to start tracking their progress and supporting their learning journey.
                    </p>
                </div>
            )}
        </div>
    );
}
