import { Users, BookOpen, Trophy, TrendingUp, Lightbulb } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LinkStudentForm from "../../components/LinkStudentForm";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useParentDashboardStats, useLinkedStudents } from "../../hooks/useParentQueries";
import Loading from "../../components/Loading";

export default function ParentDashboard() {
    const { user } = useAuth();
    const { data: dashboardData, isLoading: statsLoading } = useParentDashboardStats();
    const { data: linkedStudents = [], isLoading: studentsLoading } = useLinkedStudents();

    const loading = statsLoading || studentsLoading;


    if (loading) {
        return <Loading fullScreen={false} message="Loading your dashboard..." />;
    }

    const stats = [
        { label: "Children", value: dashboardData?.linkedStudents || "0", icon: Users, color: "text-[#00B4D8]", bg: "bg-blue-50" },
        { label: "Course Enrollments", value: dashboardData?.totalCourseEnrollments || "0", icon: BookOpen, color: "text-green-500", bg: "bg-green-50" },
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

                                {student.enrolledCourses && student.enrolledCourses.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Enrolled Courses</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {student.enrolledCourses.map((course, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-[10px] font-bold text-gray-600 flex items-center gap-1">
                                                    {course.name}
                                                    <span className="text-purple-500 font-black">
                                                        ({Math.floor((course.timeSpentSeconds || 0) / 3600)}h {Math.floor(((course.timeSpentSeconds || 0) % 3600) / 60)}m)
                                                    </span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5 mt-auto">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-gray-600 font-bold">Progress</span>
                                        <span className="font-bold text-[#00B4D8]">{Math.round(student.averageProgress || 0)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#00B4D8] rounded-full transition-all"
                                            style={{ width: `${student.averageProgress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                            </motion.div>
                        ))}
                    </div>
                </section>
            )
            }

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
