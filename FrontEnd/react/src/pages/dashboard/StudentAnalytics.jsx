import React, { useState } from "react";
import { BarChart, Activity, Clock, TrendingUp, Award, BookOpen, ChevronRight, Target, ClipboardList } from "lucide-react";
import { useStudentAnalytics, useEnrolledCourses, useCourseAnalytics } from "../../hooks/useStudentQueries";
import Loading from "../../components/Loading";
import { cn } from "../../lib/utils";

export default function StudentAnalytics() {
    const { data: analytics, isLoading: analyticsLoading } = useStudentAnalytics();
    const { data: courses = [], isLoading: coursesLoading } = useEnrolledCourses();
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const { data: courseDetail, isLoading: courseLoading } = useCourseAnalytics(selectedCourseId);

    if (analyticsLoading || coursesLoading) {
        return <Loading fullScreen={false} message="Loading learning intelligence..." />;
    }

    const student = analytics?.student || { timeSpent: 0, quizScore: 0, progress: 0 };
    const average = analytics?.average || { timeSpent: 10, quizScore: 60, progress: 50 };

    const calculatePerformance = (userScore, avgScore) => {
        const diff = userScore - avgScore;
        if (diff > 10) return { text: "Excellent", color: "text-green-500", bg: "bg-green-50" };
        if (diff < -10) return { text: "Needs Improvement", color: "text-red-500", bg: "bg-red-50" };
        return { text: "On Track", color: "text-[#00B4D8]", bg: "bg-blue-50" };
    };

    return (
        <div className="space-y-10 pb-10">
            <header>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Learning Intelligence</h1>
                <p className="text-gray-500 mt-1 font-medium">See how your learning pace and performance compares to peers.</p>
            </header>

            {/* Global Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Time Spent */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center opacity-50 group-hover:scale-110 transition-transform">
                        <Clock className="h-8 w-8 text-[#00B4D8] opacity-20" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Time Spent</h3>
                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-4xl font-black text-[#00B4D8]">{student.timeSpent}m</span>
                        <span className="text-sm font-bold text-gray-400 mb-1 font-mono">vs {average.timeSpent}m avg</span>
                    </div>

                    <div className="space-y-2 mt-6">
                        <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <span>You</span>
                            <span>{student.timeSpent}m</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00B4D8] rounded-full" style={{ width: `${Math.min((student.timeSpent / Math.max(average.timeSpent * 2, 1)) * 100, 100)}%` }}></div>
                        </div>

                        <div className="flex justify-between text-xs font-bold text-gray-500 mt-3 uppercase tracking-wider">
                            <span>Average</span>
                            <span>{average.timeSpent}m</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-200 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Quiz Score */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center opacity-50 group-hover:scale-110 transition-transform">
                        <Award className="h-8 w-8 text-[#FDB813] opacity-20" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Quiz Average</h3>
                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-4xl font-black text-[#FDB813]">{student.quizScore}%</span>
                        <span className="text-sm font-bold text-gray-400 mb-1 font-mono">vs {average.quizScore}% avg</span>
                    </div>

                    <div className="space-y-2 mt-6">
                        <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <span>You</span>
                            <span>{student.quizScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FDB813] rounded-full" style={{ width: `${student.quizScore}%` }}></div>
                        </div>

                        <div className="flex justify-between text-xs font-bold text-gray-500 mt-3 uppercase tracking-wider">
                            <span>Average</span>
                            <span>{average.quizScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-200 rounded-full" style={{ width: `${average.quizScore}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Completion Progress */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full flex items-center justify-center opacity-50 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Completion Rate</h3>
                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-4xl font-black text-green-500">{student.progress}%</span>
                        <span className="text-sm font-bold text-gray-400 mb-1 font-mono">vs {average.progress}% avg</span>
                    </div>

                    <div className="space-y-2 mt-6">
                        <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <span>You</span>
                            <span>{student.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${student.progress}%` }}></div>
                        </div>

                        <div className="flex justify-between text-xs font-bold text-gray-500 mt-3 uppercase tracking-wider">
                            <span>Average</span>
                            <span>{average.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-200 rounded-full" style={{ width: `${average.progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Deep Dive */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Course List Slider */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-[#00B4D8]" />
                        <h2 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Enrolled Courses</h2>
                    </div>
                    <div className="space-y-3">
                        {courses.map(course => (
                            <button
                                key={course.id}
                                onClick={() => setSelectedCourseId(course.id)}
                                className={cn(
                                    "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group",
                                    selectedCourseId === course.id
                                        ? "bg-[#00B4D8] border-transparent shadow-lg shadow-blue-100 transform -translate-y-1"
                                        : "bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                                )}
                            >
                                <div>
                                    <p className={cn("font-bold text-sm line-clamp-1", selectedCourseId === course.id ? "text-white" : "text-gray-900")}>
                                        {course.name}
                                    </p>
                                    <p className={cn("text-[10px] font-bold uppercase", selectedCourseId === course.id ? "text-blue-100" : "text-gray-400")}>
                                        {course.progress}% Complete
                                    </p>
                                </div>
                                <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", selectedCourseId === course.id ? "text-white" : "text-gray-300")} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Course Details */}
                <div className="lg:col-span-2">
                    {!selectedCourseId ? (
                        <div className="h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-gray-50/50">
                            <Activity className="h-12 w-12 text-gray-300 mb-4 animate-pulse" />
                            <h3 className="font-bold text-gray-900 mb-1">Select a course</h3>
                            <p className="text-gray-500 text-sm font-medium">Click on a course to see detailed performance analytics.</p>
                        </div>
                    ) : courseLoading ? (
                        <div className="h-full min-h-[300px] bg-white border border-gray-100 rounded-3xl flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B4D8]"></div>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 leading-tight">
                                        {courses.find(c => c.id === selectedCourseId)?.name}
                                    </h3>
                                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-tight">Technical Analysis & Milestones</p>
                                </div>
                                <div className="bg-blue-50 text-[#00B4D8] px-4 py-2 rounded-2xl text-xs font-black uppercase">
                                    Course ID: {selectedCourseId}
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Quiz Performance */}
                                <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:border-[#FDB813]/30 transition-colors">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-[#FDB813]">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <h4 className="font-bold text-gray-900">Quiz Precision</h4>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black text-gray-900">{courseDetail.quizzes.avgScore}%</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {courseDetail.quizzes.attemptedCount} of {courseDetail.quizzes.totalAttempts} Attempted
                                        </p>
                                    </div>
                                </div>

                                {/* Projects/Assignments */}
                                <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:border-green-500/30 transition-colors">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                                            <ClipboardList className="h-5 w-5" />
                                        </div>
                                        <h4 className="font-bold text-gray-900">Practical milestones</h4>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black text-gray-900">{courseDetail.assignments.approvedCount}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {courseDetail.assignments.totalSubmissions} Total Submissions
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Progress Bar */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Course Completion</h4>
                                        <p className="text-xs text-gray-400 font-medium">Current progress based on lesson completion</p>
                                    </div>
                                    <span className="text-lg font-black text-[#00B4D8]">{courseDetail.overview.progress}%</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#00B4D8] to-blue-400 rounded-full transition-all duration-1000" style={{ width: `${courseDetail.overview.progress}%` }}></div>
                                </div>
                                <p className="text-center text-[10px] font-bold text-gray-400 uppercase">
                                    {courseDetail.lessons.completed} / {courseDetail.lessons.total} Lessons Finished
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
