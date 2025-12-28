import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PlayCircle, Lock, CheckCircle, Clock, FileText, Download, ChevronDown, ChevronUp, Star, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CourseDetail() {
    const { courseId } = useParams();
    const [activeTab, setActiveTab] = useState("curriculum");

    // Mock Data
    const course = {
        title: "Introduction to Python Programming",
        description: "Master the basics of Python, the most popular programming language for Data Science and AI. This course covers variables, loops, functions, and object-oriented programming.",
        instructor: {
            name: "Dr. Almaz Tadesse",
            role: "Senior Software Engineer",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
        },
        progress: 65,
        modules: [
            {
                id: 1,
                title: "Module 1: Python Basics",
                lessons: [
                    { id: 1, title: "Setting up Python Environment", duration: "10:00", type: "video", status: "completed" },
                    { id: 2, title: "Variables and Data Types", duration: "15:30", type: "video", status: "completed" },
                    { id: 3, title: "First Python Script", duration: "08:45", type: "video", status: "completed" },
                ]
            },
            {
                id: 2,
                title: "Module 2: Control Flow",
                lessons: [
                    { id: 4, title: "If/Else Statements", duration: "12:20", type: "video", status: "unlocked" },
                    { id: 5, title: "For and While Loops", duration: "20:10", type: "video", status: "locked" },
                    { id: 6, title: "Loop Control Statements", duration: "14:15", type: "video", status: "locked" },
                    { id: 7, title: "Module 2 Quiz", duration: "15 mins", type: "quiz", status: "locked" },
                ]
            }
        ]
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div className="bg-white rounded-[2.5rem] p-6 lg:p-12 border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent hidden lg:block"></div>

                <div className="flex flex-col lg:flex-row gap-10 lg:items-center relative z-10">
                    <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-[#00B4D8]/10 text-[#00B4D8] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Coding</span>
                            <span className="bg-purple-50 text-purple-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Beginner</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">{course.title}</h1>
                        <p className="text-gray-500 text-lg leading-relaxed font-medium line-clamp-3">{course.description}</p>

                        <div className="flex items-center gap-4">
                            <img src={course.instructor.avatar} alt={course.instructor.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-gray-50" />
                            <div>
                                <p className="text-sm font-black text-gray-900">{course.instructor.name}</p>
                                <p className="text-xs font-bold text-gray-400">{course.instructor.role}</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400">
                                <span>Batch Progress</span>
                                <span className="text-[#00B4D8]">{course.progress}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${course.progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[#00B4D8] to-blue-400 rounded-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                to={`/dashboard/student/courses/${courseId}/learn/4`}
                                className="flex-1 bg-[#00B4D8] text-white font-black py-4 rounded-2xl hover:bg-[#0096B4] transition-all shadow-xl shadow-blue-500/20 text-center flex items-center justify-center gap-2 uppercase tracking-widest text-xs hover:-translate-y-0.5"
                            >
                                <PlayCircle className="h-5 w-5" /> Continue Learning
                            </Link>
                            <button className="px-6 py-4 border border-gray-100 bg-gray-50 rounded-2xl hover:bg-white hover:border-[#00B4D8]/20 text-gray-400 hover:text-[#00B4D8] transition-all flex items-center justify-center">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Course Preview */}
                    <div className="lg:w-2/5 aspect-[4/3] relative rounded-[2rem] overflow-hidden group shadow-2xl ring-1 ring-gray-100">
                        <img src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                                <PlayCircle className="h-10 w-10 text-[#00B4D8] fill-current" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex gap-8 border-b border-gray-100 px-4">
                {['curriculum', 'overview', 'instructor'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-[#00B4D8]' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 w-full h-1 bg-[#00B4D8] rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'curriculum' && (
                        <motion.div
                            key="curriculum"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 lg:grid-cols-1 gap-6"
                        >
                            {course.modules.map((module) => (
                                <div key={module.id} className="border border-gray-100 rounded-[2rem] overflow-hidden bg-white shadow-sm ring-1 ring-gray-50/50">
                                    <div className="px-8 py-5 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-gray-100">
                                        <h3 className="font-black text-gray-900 uppercase tracking-tight">{module.title}</h3>
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-gray-100">{module.lessons.length} Lessons</span>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {module.lessons.map(lesson => (
                                            <div key={lesson.id} className={cn(
                                                "px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200",
                                                lesson.status === 'locked' ? 'opacity-40 grayscale' : 'hover:bg-blue-50/30 group'
                                            )}>
                                                <div className="flex items-center gap-5">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-95",
                                                        lesson.status === 'completed' ? 'bg-green-100 text-green-500' :
                                                            lesson.status === 'locked' ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-[#00B4D8]'
                                                    )}>
                                                        {lesson.status === 'completed' ? <CheckCircle className="h-6 w-6" /> :
                                                            lesson.status === 'locked' ? <Lock className="h-5 w-5" /> : <PlayCircle className="h-6 w-6" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-gray-900 line-clamp-1">{lesson.title}</p>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight flex items-center gap-1.5">
                                                                {lesson.type === 'video' ? <PlayCircle className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                                                                {lesson.type}
                                                            </p>
                                                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5" /> {lesson.duration}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {lesson.status !== 'locked' && (
                                                    <Link
                                                        to={`/dashboard/student/courses/${courseId}/learn/${lesson.id}`}
                                                        className="sm:opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.1em] px-6 py-2.5 rounded-xl transition-all hover:bg-[#00B4D8] text-center"
                                                    >
                                                        {lesson.status === 'completed' ? 'Review' : 'Continue'}
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm"
                        >
                            <h3 className="font-black text-gray-900 text-2xl mb-8 tracking-tight uppercase">Learning Journey</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: 'Python Fundamentals', desc: 'Syntax, variables, and data structures.' },
                                    { title: 'Project-Based Learning', desc: 'Build 5 real-world applications.' },
                                    { title: 'Problem Solving', desc: 'Master algorithmic thinking.' },
                                    { title: 'Career Prep', desc: 'Code reviews and portfolio building.' }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <CheckCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">{item.title}</h4>
                                            <p className="text-gray-400 text-xs font-bold leading-relaxed mt-1">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
