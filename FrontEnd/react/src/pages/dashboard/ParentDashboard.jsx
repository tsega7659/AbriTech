import { Users, BookOpen, Trophy, TrendingUp, Lightbulb } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LinkStudentForm from "../../components/LinkStudentForm";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import Loading from "../../components/Loading";

export default function ParentDashboard() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [linkedStudents, setLinkedStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsResponse, studentsResponse] = await Promise.all([
                    api.get('/parents/dashboard'),
                    api.get('/parents/linked-students')
                ]);

                setDashboardData(statsResponse.data);
                setLinkedStudents(studentsResponse.data);
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
        { label: "Children", value: dashboardData?.linkedStudents || "0", icon: Users, color: "text-[#00B4D8]", bg: "bg-blue-50" },
        { label: "Course Enrollments", value: dashboardData?.totalCourseEnrollments || "0", icon: BookOpen, color: "text-green-500", bg: "bg-green-50" },
        { label: "Lessons Completed", value: dashboardData?.totalLessonsCompleted || "0", icon: Trophy, color: "text-[#FDB813]", bg: "bg-yellow-50" },
        { label: "Avg Quiz Score", value: dashboardData?.averageQuizScore ? `${dashboardData.averageQuizScore}%` : "N/A", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-10">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="max-w-xl">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Parent <span className="text-[#00B4D8]">Portal</span>
                    </h1>
                    <p className="text-gray-500 mt-3 font-medium text-lg leading-relaxed">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'User'}. Stay connected with your children's educational progress and achievements.
                    </p>
                </div>
                <div className="w-full xl:w-[450px]">
                    <LinkStudentForm />
                </div>
            </header>

            {/* Monthly Recognition Alert */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Trophy className="w-48 h-48 text-[#FDB813]" />
                </div>
                <div className="bg-white p-4 rounded-3xl text-[#FDB813] shadow-lg shadow-yellow-200/50 flex-shrink-0 z-10">
                    <Trophy className="h-10 w-10" />
                </div>
                <div className="text-center md:text-left z-10">
                    <h3 className="text-[#FDB813] text-xl font-black mb-3 uppercase tracking-widest">Monthly Recognition</h3>
                    <p className="text-yellow-900/80 text-lg leading-relaxed font-medium mb-4 italic">
                        "Dear {user?.fullName || 'Valued Parent'}, thank you for your unwavering commitment to quality education. Your dedication to your children's learning journey is transforming their future. Together, we are shaping Ethiopia's next generation of innovators!"
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <div className="h-px w-8 bg-yellow-300"></div>
                        <p className="text-sm text-yellow-600 font-black uppercase tracking-tighter">The AbriTech Team</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards - Children */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12", stat.bg, stat.color)}>
                            <stat.icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
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
                                                <span key={idx} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-[10px] font-bold text-gray-600">
                                                    {course}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 mt-auto">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Average Progress</span>
                                        <span className="font-bold text-[#00B4D8]">{Math.round(student.averageProgress || 0)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
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
            )}

            {/* Tip Card */}
            <div className="bg-[#00B4D8] rounded-[2.5rem] p-8 md:p-10 text-white flex flex-col md:flex-row gap-8 items-center shadow-2xl shadow-blue-200">
                <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-md flex-shrink-0 animate-pulse">
                    <Lightbulb className="h-12 w-12 text-white" />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black mb-3 tracking-tight">Expert Parenting Tip: Screen Time Balance</h3>
                    <p className="text-blue-50 text-lg leading-relaxed font-medium opacity-90">
                        While digital learning is essential, balance is the key to healthy growth. Encourage your child to take a 5-minute movement break every hour. Remember the <strong>20-20-20 rule</strong>: every 20 minutes, look at something 20 feet away for 20 seconds to protect their blossoming vision.
                    </p>
                </div>
            </div>
        </div>
    );
}
