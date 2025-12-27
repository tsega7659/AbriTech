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
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-3/5 space-y-4">
                        <div className="flex gap-2 text-xs font-bold text-[#00B4D8]">
                            <span className="bg-blue-50 px-2 py-1 rounded-md">Coding</span>
                            <span className="bg-blue-50 px-2 py-1 rounded-md">Beginner</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                        <p className="text-gray-600 leading-relaxed">{course.description}</p>

                        <div className="flex items-center gap-4 pt-2">
                            <img src={course.instructor.avatar} alt={course.instructor.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="text-sm font-bold text-gray-900">{course.instructor.name}</p>
                                <p className="text-xs text-gray-500">{course.instructor.role}</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="flex justify-between text-sm font-medium mb-2">
                                <span>Course Progress</span>
                                <span className="text-[#00B4D8]">{course.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00B4D8] rounded-full" style={{ width: `${course.progress}%` }}></div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Link
                                to={`/dashboard/student/courses/${courseId}/learn/4`}
                                className="flex-1 bg-[#00B4D8] text-white font-bold py-3.5 rounded-xl hover:bg-[#0096B4] transition-colors shadow-lg shadow-blue-200 text-center flex items-center justify-center gap-2"
                            >
                                <PlayCircle className="h-5 w-5" /> Continue Learning
                            </Link>
                            <button className="px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    {/* Course Preview Image or Feature */}
                    <div className="hidden md:block w-2/5 relative rounded-xl overflow-hidden h-72">
                        <img src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="bg-white/30 backdrop-blur-md p-4 rounded-full">
                                <PlayCircle className="h-12 w-12 text-white fill-[#00B4D8]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex gap-6 border-b border-gray-100">
                {['overview', 'curriculum', 'instructor'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-bold capitalize transition-colors relative ${activeTab === tab ? 'text-[#00B4D8]' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00B4D8]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === 'curriculum' && (
                    <div className="space-y-4">
                        {course.modules.map((module, index) => (
                            <div key={module.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                                <div className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors">
                                    <h3 className="font-bold text-gray-900">{module.title}</h3>
                                    <span className="text-xs text-gray-500 font-medium">{module.lessons.length} Lessons</span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {module.lessons.map(lesson => (
                                        <div key={lesson.id} className={`p-4 flex items-center justify-between ${lesson.status === 'locked' ? 'bg-gray-50/50 opacity-60' : 'bg-white hover:bg-blue-50/50'} transition-colors group`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${lesson.status === 'completed' ? 'bg-green-100 text-green-500' : lesson.status === 'locked' ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-[#00B4D8]'}`}>
                                                    {lesson.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : lesson.status === 'locked' ? <Lock className="h-4 w-4" /> : <PlayCircle className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${lesson.status === 'completed' ? 'text-gray-900' : 'text-gray-700'}`}>{lesson.title}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        {lesson.type === 'video' ? <PlayCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                                        {lesson.type === 'video' ? 'Video' : 'Quiz'} • {lesson.duration}
                                                    </p>
                                                </div>
                                            </div>
                                            {lesson.status !== 'locked' && (
                                                <Link
                                                    to={`/dashboard/student/courses/${courseId}/learn/${lesson.id}`}
                                                    className="opacity-0 group-hover:opacity-100 bg-[#00B4D8] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    {lesson.status === 'completed' ? 'Review' : 'Start'}
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'overview' && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 text-gray-600">
                        <h3 className="font-bold text-gray-900 text-lg mb-4">What you'll learn</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {['Understand core Python concepts', 'Build real-world applications', 'Automate boring tasks', 'Analyze data with Pandas'].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-5 w-5 text-green-500" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
