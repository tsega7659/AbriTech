import { BookOpen, Trophy, TrendingUp, Clock, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import Loading from "../../components/Loading";

export default function StudentDashboard() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsResponse, coursesResponse] = await Promise.all([
                    api.get('/students/dashboard'),
                    api.get('/students/courses')
                ]);

                setDashboardData(statsResponse.data);
                setCourses(coursesResponse.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <Loading fullScreen={false} message="Loading your dashboard..." />;
    }

    const stats = [
        { label: "Enrolled Courses", value: dashboardData?.enrolledCourses || "0", icon: BookOpen, color: "text-[#00B4D8]", bg: "bg-blue-50" },
        { label: "Lessons Completed", value: dashboardData?.lessonsCompleted || "0", icon: Trophy, color: "text-green-500", bg: "bg-green-50" },
        { label: "Average Score", value: dashboardData?.averageScore ? `${dashboardData.averageScore}%` : "N/A", icon: TrendingUp, color: "text-[#FDB813]", bg: "bg-yellow-50" },
        { label: "Learning Time", value: dashboardData?.learningTime || "0h", icon: Clock, color: "text-purple-500", bg: "bg-purple-50" },
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
                <div className="hidden sm:block">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student Portal</p>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
                    >
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                            <stat.icon className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 leading-none">{stat.value}</h3>
                            <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-tight">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Continue Learning Section */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Courses</h2>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/courses"
                            className="hidden sm:flex items-center gap-2 bg-blue-50 text-[#00B4D8] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#00B4D8] hover:text-white transition-all border border-blue-100"
                        >
                            <Plus className="h-4 w-4" /> Enroll in More
                        </Link>
                        <Link to="/dashboard/student/courses" className="text-sm font-bold text-gray-400 hover:text-[#00B4D8] transition-colors flex items-center gap-1.5 group">
                            View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>


                {courses.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Enrolled Yet</h3>
                        <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a course!</p>
                        <Link to="/courses" className="inline-flex items-center gap-2 bg-[#00B4D8] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0096B4] transition-all">
                            Browse Courses <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {courses.map((course, i) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                key={course.id}
                                className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all group lg:hover:-translate-y-1"
                            >
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
                                            <Link
                                                to={`/dashboard/student/courses/${course.id}/learn/1`}
                                                className="text-sm font-bold text-gray-800 hover:text-[#00B4D8] transition-colors"
                                            >
                                                Resume Lesson
                                            </Link>

                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#00B4D8]/10 group-hover:text-[#00B4D8] transition-colors">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
