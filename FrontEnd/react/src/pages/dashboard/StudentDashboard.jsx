import { BookOpen, Trophy, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export default function StudentDashboard() {
    const { user } = useAuth();

    const stats = [
        { label: "Enrolled Courses", value: "3", icon: BookOpen, color: "text-[#00B4D8]", bg: "bg-blue-50" },
        { label: "Lessons Completed", value: "4", icon: Trophy, color: "text-green-500", bg: "bg-green-50" },
        { label: "Average Score", value: "90%", icon: TrendingUp, color: "text-[#FDB813]", bg: "bg-yellow-50" },
        { label: "Learning Time", value: "12h", icon: Clock, color: "text-purple-500", bg: "bg-purple-50" },
    ];

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
                    <Link to="/dashboard/student/courses" className="text-sm font-bold text-[#00B4D8] hover:text-[#0096B4] transition-colors flex items-center gap-1.5 group">
                        View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {[
                        { title: "Introduction to Python", progress: 65, img: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=600", tag: "Coding", color: "bg-blue-500" },
                        { title: "Robotics Basics", progress: 30, img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600", tag: "Robotics", color: "bg-[#FDB813]" },
                        { title: "Web Development", progress: 10, img: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=600", tag: "React", color: "bg-purple-500" }
                    ].map((course, i) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            key={i}
                            className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all group lg:hover:-translate-y-1"
                        >
                            <div className="h-48 relative overflow-hidden">
                                <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-xl text-xs font-black text-gray-900 shadow-sm uppercase tracking-wider">
                                    {course.tag}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-1">{course.title}</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-gray-400 uppercase tracking-tighter">Progress</span>
                                        <span className="text-[#00B4D8]">{course.progress}%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", course.color)}
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <Link
                                            to="#"
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
            </section>
        </div>
    );
}
