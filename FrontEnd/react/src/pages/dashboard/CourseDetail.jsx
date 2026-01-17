import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { PlayCircle, Lock, CheckCircle, Clock, FileText, Download, ChevronDown, ChevronUp, Star, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import Loading from "../../components/Loading";


export default function CourseDetail() {
    const { courseId } = useParams();
    const [activeTab, setActiveTab] = useState("curriculum");
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                // We'll use the existing public courses endpoint or a specific student one if available
                // For now, fetching all and filtering or assuming we have a detail endpoint
                const response = await api.get(`/courses`);
                const foundCourse = response.data.find(c => c.id === parseInt(courseId));
                setCourse(foundCourse);
            } catch (error) {
                console.error("Failed to fetch course details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetails();
    }, [courseId]);

    if (loading) return <Loading fullScreen={false} message="Loading course details..." />;
    if (!course) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
            <Link to="/dashboard/student/courses" className="text-[#00B4D8] font-bold mt-4 inline-block underline">Back to My Courses</Link>
        </div>
    );

    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://abritech.onrender.com';


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
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">{course.name}</h1>
                        <p className="text-gray-500 text-lg leading-relaxed font-medium line-clamp-3">{course.description}</p>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#00B4D8] font-bold">
                                {course.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900">Course Instructor</p>
                                <p className="text-xs font-bold text-gray-400">Expert Educator</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400">
                                <span>Course Progress</span>
                                <span className="text-[#00B4D8]">{course.progress || 0}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${course.progress || 0}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[#00B4D8] to-blue-400 rounded-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                to={`/dashboard/student/courses/${courseId}/learn/1`}
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
                    <div className="lg:order-2 lg:w-2/5 aspect-[4/3] relative rounded-[2rem] overflow-hidden group shadow-2xl ring-1 ring-gray-100">
                        <img
                            src={course.image ? (course.image.startsWith('http') ? course.image : `${API_BASE_URL}${course.image}`) : "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />

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
                            className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100"
                        >
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-[#00B4D8] mx-auto mb-6">
                                <Clock className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Curriculum Under Review</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">We're currently finalizing the lesson sequence to provide the best learning experience.</p>
                            <Link
                                to={`/dashboard/student/courses/${courseId}/learn/1`}
                                className="mt-8 inline-block bg-gray-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#00B4D8] transition-all"
                            >
                                Preview Lessons
                            </Link>
                        </motion.div>
                    )}

                    {activeTab === 'instructor' && (
                        <motion.div
                            key="instructor"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-10"
                        >
                            <div className="w-32 h-32 rounded-[2rem] bg-blue-100 flex items-center justify-center text-[#00B4D8] text-4xl font-black shadow-inner">
                                {course.name.charAt(0)}
                            </div>
                            <div className="text-center md:text-left space-y-4 flex-1">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">AbriTech Certified Instructor</h3>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                                    Our instructors are industry experts and certified educators dedicated to helping you master {course.name}.
                                </p>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
