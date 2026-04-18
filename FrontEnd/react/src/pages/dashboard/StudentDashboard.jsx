import { BookOpen, Trophy, TrendingUp, Clock, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useStudentDashboard, useEnrolledCourses } from "../../hooks/useStudentQueries";
import Loading from "../../components/Loading";

export default function StudentDashboard() {
    const { user } = useAuth();
    const { data: dashboardData, isLoading: statsLoading } = useStudentDashboard();
    const { data: courses = [], isLoading: coursesLoading } = useEnrolledCourses();

    const loading = statsLoading || coursesLoading;


    if (loading) {
        return <Loading fullScreen={false} message="Loading your dashboard..." />;
    }

    const stats = dashboardData?.stats;

    const statsCards = [
        { label: "Enrolled Courses", value: stats?.enrolledCourses || "0", icon: BookOpen, color: "text-[#00B4D8]", bg: "bg-blue-50" },
        { label: "Active Courses", value: stats?.activeCourses || "0", icon: BookOpen, color: "text-[#FDB813]", bg: "bg-yellow-50" },
        { label: "Completed Courses", value: stats?.completedCourses || "0", icon: Trophy, color: "text-green-500", bg: "bg-green-50" },
        { label: "Average Score", value: (stats?.averageScore !== null && stats?.averageScore !== undefined) ? `${stats.averageScore}%` : "0%", icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50" },
        { label: "Weekly Learning", value: stats?.weeklyLearningTime || "0h", icon: Clock, color: "text-purple-500", bg: "bg-purple-50" },
        { label: "Upcoming Quizzes", value: dashboardData?.upcomingQuizzes?.length || "0", icon: BookOpen, color: "text-red-500", bg: "bg-red-50" },
        { label: "Pending Projects", value: dashboardData?.pendingProjects?.length || "0", icon: BookOpen, color: "text-orange-500", bg: "bg-orange-50" },
    ];

    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://abritech.onrender.com';

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Welcome back, <span className="text-[#00B4D8]">{user?.fullName?.split(' ')[0] || 'Student'}</span>!
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Your learning journey continues here.</p>
                </div>
                <div className="hidden sm:block flex gap-3">
                    <Link to="/dashboard/student/portfolio" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                        View Portfolio
                    </Link>
                </div>
            </header>

            {/* Comprehensive Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
                    >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 leading-none">{stat.value}</h3>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Active Courses */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Active Courses</h2>
                            <Link to="/dashboard/student/courses" className="text-sm font-bold text-gray-400 hover:text-[#00B4D8] flex items-center gap-1 group">
                                View All <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        
                        {courses.length === 0 ? (
                            // Empty state
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center">
                                <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Courses Enrolled Yet</h3>
                                <Link to="/courses" className="text-[#00B4D8] font-bold text-sm hover:underline">Browse Courses</Link>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-6">
                        {courses.map((course, i) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                key={course.id}
                                className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all group lg:hover:-translate-y-1"
                            >
                                <Link to={`/dashboard/student/courses/${course.id}/learn`}>
                                    <div className="h-48 relative overflow-hidden">
                                        <img
                                            src={course.image ? (course.image.startsWith('http') ? course.image : `${API_BASE_URL}${course.image}`) : 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=600'}
                                            alt={course.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-xl text-xs font-black text-gray-900 shadow-sm uppercase tracking-wider">
                                            {course.level}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-1">{course.name}</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-gray-400 uppercase tracking-tighter">Progress</span>
                                                <span className="text-[#00B4D8]">{course.progress || 0}%</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000 bg-[#00B4D8]"
                                                    style={{ width: `${course.progress || 0}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <button
                                                    className="text-sm font-bold text-gray-800 hover:text-[#00B4D8] transition-colors"
                                                >
                                                    Resume Lesson
                                                </button>

                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#00B4D8]/10 group-hover:text-[#00B4D8] transition-colors">
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
                    
                    {/* Recommended Courses */}
                    {dashboardData?.recommendedCourses?.length > 0 && (
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Recommended For You</h2>
                                <Link to="/courses" className="text-[#00B4D8] text-sm font-bold hover:underline">Browse All</Link>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {dashboardData.recommendedCourses.map(course => (
                                    <Link key={course.id} to="/courses" className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                            <img src={course.image ? `${API_BASE_URL}${course.image}` : 'https://placehold.co/100x100'} alt={course.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{course.name}</h4>
                                            <span className="text-xs text-gray-500 uppercase font-bold">{course.level}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column: Achievements & Tasks */}
                <div className="space-y-8">
                    {/* Achievements */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-900">Recent Achievements</h3>
                            <Trophy className="h-5 w-5 text-[#FDB813]" />
                        </div>
                        {dashboardData?.achievements?.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Keep learning to earn badges!</p>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {dashboardData?.achievements?.map(a => (
                                    <div key={a.id} className="text-center group" title={a.description}>
                                        <div className="w-12 h-12 mx-auto bg-yellow-50 rounded-full flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform cursor-help">
                                            {a.icon || '🎖️'}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-600 leading-tight">{a.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Tasks */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-6">Pending Tasks</h3>
                        
                        <div className="space-y-4">
                            {dashboardData?.upcomingQuizzes?.map(quiz => (
                                <div key={quiz.id} className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                                        <BookOpen className="h-4 w-4 text-red-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">{quiz.title}</h4>
                                        <p className="text-xs text-gray-500">{quiz.courseName}</p>
                                    </div>
                                </div>
                            ))}
                            {dashboardData?.pendingProjects?.map(proj => (
                                <div key={proj.id} className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                                        <Clock className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">{proj.title}</h4>
                                        <p className="text-xs text-gray-500">Due: {new Date(proj.dueDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                            {(!dashboardData?.upcomingQuizzes?.length && !dashboardData?.pendingProjects?.length) && (
                                <p className="text-sm text-gray-500 text-center py-4">You're all caught up!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
