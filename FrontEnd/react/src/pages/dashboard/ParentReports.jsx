import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Briefcase, MessageSquare, AlertTriangle, CheckCircle, Brain, Target } from 'lucide-react';
import Loading from '../../components/Loading';
import { useParentMonthlyReport } from '../../hooks/useParentQueries';
import { cn } from '../../lib/utils';

export default function ParentReports() {
    const { data: report, isLoading } = useParentMonthlyReport();

    if (isLoading) return <Loading />;

    if (!report) {
        return (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Available</h3>
                <p className="text-gray-500 font-medium">Monthly reports will appear here once your children start learning.</p>
            </div>
        );
    }

    const { learningHours = [], quizPerformance = [], projectsCompleted = [], feedback = [], recommendations = [] } = report;

    // Helper for max hours to scale the bars
    const maxHours = Math.max(...learningHours.map(w => w.hours), 5); // Minimum 5 hours scale

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                    Monthly <span className="text-[#00B4D8]">Report</span>
                </h1>
                <p className="text-gray-500 mt-2 text-lg font-medium">Comprehensive overview of your children's performance and personalized insights.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Learning Hours Chart (CSS visual) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Learning Intensity</h2>
                            <p className="text-sm text-gray-500 font-medium">Hours spent across all courses</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#00B4D8]">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="flex items-end gap-2 md:gap-4 h-48 mt-4 pt-4 border-b border-gray-100 relative">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 bottom-0 top-0 w-8 flex flex-col justify-between text-[10px] font-black text-gray-300 pb-1 -ml-2">
                            <span>{Math.ceil(maxHours)}h</span>
                            <span>{Math.ceil(maxHours / 2)}h</span>
                            <span>0h</span>
                        </div>
                        
                        <div className="flex-1 flex items-end justify-around h-full pl-6">
                            {learningHours.length > 0 ? learningHours.map((week, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2 group flex-1">
                                    <div className="w-full max-w-[40px] bg-gray-100 rounded-t-xl overflow-hidden self-end relative" style={{ height: '100%' }}>
                                        <div 
                                            className="absolute bottom-0 w-full bg-[#00B4D8] rounded-t-xl transition-all duration-1000 group-hover:bg-blue-400"
                                            style={{ height: `${(week.hours / maxHours) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Wk {week.weekNumber}</span>
                                </div>
                            )) : (
                                <div className="text-gray-400 text-sm font-medium w-full text-center pb-8">No data for this month</div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Performance Highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-900">Performance By Child</h2>
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                            <Target className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {quizPerformance.length > 0 ? quizPerformance.map((student, idx) => {
                             const project = projectsCompleted.find(p => p.studentName === student.studentName);
                             
                             return (
                                <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#00B4D8] font-black text-lg">
                                            {student.studentName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{student.studentName}</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                                {student.totalQuizzes} Quizzes Taken
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="text-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex-1 md:flex-none">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Quiz Avg</p>
                                            <p className="text-lg font-black text-[#00B4D8]">{Math.round(student.avgScore || 0)}%</p>
                                        </div>
                                        <div className="text-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex-1 md:flex-none">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Projects</p>
                                            <p className="text-lg font-black text-purple-500">{project?.count || 0}</p>
                                        </div>
                                    </div>
                                </div>
                             );
                        }) : (
                             <div className="text-center py-8 text-gray-400 font-medium">No performance data yet.</div>
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Automated Recommendations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
                >
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-900">AI Recommendations</h2>
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <Brain className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                             <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-orange-100 bg-orange-50/30">
                                 <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0">
                                     <AlertTriangle className="w-4 h-4" />
                                 </div>
                                 <div>
                                     <p className="text-sm font-bold text-gray-900 mb-1">{rec.studentName}</p>
                                     <p className="text-sm text-gray-600 leading-snug">{rec.advice}</p>
                                 </div>
                             </div>
                        )) : (
                             <div className="text-center py-8 text-gray-400 font-medium">No recommendations available.</div>
                        )}
                    </div>
                </motion.div>

                {/* Instructor Feedback */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-900">Instructor Feedback</h2>
                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="space-y-4">
                       {feedback.length > 0 ? feedback.map((fb, idx) => (
                           <div key={idx} className="bg-gray-50 p-4 rounded-2xl">
                               <div className="flex justify-between items-start mb-2">
                                   <div>
                                       <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4D8]">{fb.studentName}</span>
                                       <h4 className="font-bold text-gray-900 text-sm">{fb.assignmentTitle}</h4>
                                   </div>
                                    <span className="text-[10px] text-gray-400 font-bold">
                                        {new Date(fb.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                               </div>
                               <p className="text-sm text-gray-600 italic">"{fb.feedback}"</p>
                           </div>
                       )) : (
                           <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                               <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                               <p className="text-sm font-medium text-gray-500">No instructor feedback recorded.</p>
                           </div>
                       )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
