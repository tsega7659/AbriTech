import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, BookOpen, Clock, ChevronRight, Star, ArrowRight, CheckCircle2, Cpu, Code, Globe, Boxes, Laptop } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPeopleGroup } from "react-icons/fa6";
import Loading from "../components/Loading";
import { useAllCourses } from "../hooks/useStudentQueries";
import { useAuth } from "../context/AuthContext";
import apiClient from "../lib/apiClient";
import FeedbackModal from "../components/FeedbackModal";
import { cn } from "../lib/utils";
import schoolpartership from "../assets/schoolpartner.jpg";

const API_BASE_URL = apiClient.defaults.baseURL.replace('/api', '');

const categories = [
    { name: "All", icon: Filter },
    { name: "STEM", icon: Code },
    { name: "Robotics", icon: Cpu },
    { name: "Programming", icon: Globe },
    { name: "3D Design", icon: Boxes },
    { name: "Web Development", icon: Laptop },
];
const levels = ["All", "Beginner", "Intermediate", "Advanced", "All Levels"];

export default function Courses() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: allCoursesData = [], isLoading: loading } = useAllCourses();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLevel, setSelectedLevel] = useState("All");
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [enrolling, setEnrolling] = useState(null);
    const [enrollSuccess, setEnrollSuccess] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    useEffect(() => {
        let filtered = allCoursesData.filter(course => {
            const matchesSearch = (course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;

            let normalizedCourseLevel = course.level;
            if (normalizedCourseLevel === 'advanced') normalizedCourseLevel = 'All Levels';
            normalizedCourseLevel = normalizedCourseLevel?.charAt(0).toUpperCase() + normalizedCourseLevel?.slice(1);

            const matchesLevel = selectedLevel === "All" || normalizedCourseLevel === selectedLevel;

            return matchesSearch && matchesCategory && matchesLevel;
        });
        setFilteredCourses(filtered);
    }, [searchTerm, selectedCategory, selectedLevel, allCoursesData]);

    const handleEnroll = async (courseId) => {
        if (!user) {
            navigate('/auth/get-started');
            return;
        }

        setEnrolling(courseId);
        try {
            await apiClient.post('/courses/enroll', { courseId });
            setEnrollSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/student');
            }, 2000);
        } catch (error) {
            console.error("Failed to enroll:", error);
            showFeedback("Enrollment Failed", error.response?.data?.message || 'Failed to enroll in course', "error");
            setEnrolling(null);
        }
    };

    if (loading) return <Loading fullScreen={false} message="Curating our STEM library..." />;

    return (
        <div className="bg-white min-h-screen pb-20 relative overflow-hidden">
            {/* Header Section */}
            <section className="bg-gray-50 py-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight"
                    >
                        Explore Our <span className="text-primary">STEM Universe</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-500 max-w-2xl mx-auto font-medium"
                    >
                        Comprehensive curriculum covering robotics, mechatronics, programming, and the Internet of Things suitable for all ages.
                    </motion.p>

                    {/* Search and Filters */}
                    <div className="mt-12 max-w-5xl mx-auto space-y-6">
                        <div className="bg-white p-2 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="What do you want to learn today?"
                                    className="w-full pl-14 pr-6 py-4 bg-transparent focus:outline-none text-gray-700 font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-bold border transition-all flex items-center gap-2",
                                        selectedCategory === cat.name
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                            : "bg-white border-gray-100 text-gray-600 hover:border-gray-300"
                                    )}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-2">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">Filter Level:</span>
                            {levels.map(level => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(level)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-bold border transition-all",
                                        selectedLevel === level
                                            ? "bg-[#FDB813]/10 border-[#FDB813] text-[#FDB813]"
                                            : "bg-transparent border-gray-200 text-gray-500 hover:border-gray-300"
                                    )}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <AnimatePresence mode="wait">
                    {filteredCourses.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                        >
                            {filteredCourses.map((course) => (
                                <motion.div
                                    layout
                                    key={course.id}
                                    className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={course.image ? (course.image.startsWith('http') ? course.image : `${API_BASE_URL}${course.image}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                                            alt={course.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-6 left-6 flex gap-2">
                                            <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm border border-white/50">
                                                {course.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-1">
                                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                                            {course.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2">
                                            {course.description}
                                        </p>

                                        <div className="mt-auto space-y-6">
                                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                                <div className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                                                    {course.level === 'advanced' ? 'All Levels' : (course.level?.charAt(0).toUpperCase() + course.level?.slice(1))}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    <span className="text-xs font-bold text-gray-500">Self-Paced</span>
                                                </div>
                                            </div>

                                            {user && user.role === 'student' ? (
                                                <button
                                                    onClick={() => handleEnroll(course.id)}
                                                    disabled={enrolling === course.id}
                                                    className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                                >
                                                    {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                                                </button>
                                            ) : (
                                                <Link to="/auth/get-started" className="block w-full text-center bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                                    Enroll Now
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-40 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200"
                        >
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <BookOpen className="w-10 h-10 text-gray-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h2>
                            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                            <button
                                onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setSelectedLevel("All"); }}
                                className="mt-6 text-primary font-black uppercase tracking-widest text-xs hover:underline"
                            >
                                Clear all filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Modals and Overlays */}
            <AnimatePresence>
                {enrolling && !enrollSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2.5rem] p-12 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
                                <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "linear" }} className="h-full bg-primary" />
                            </div>
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-primary mx-auto animate-bounce">
                                <Cpu className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Processing</h3>
                        </div>
                    </motion.div>
                )}

                {enrollSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-primary flex items-center justify-center p-4">
                        <div className="text-center space-y-8">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mx-auto shadow-2xl">
                                <CheckCircle2 className="h-12 w-12" />
                            </div>
                            <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Welcome Aboard!</h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
            />

            {/* School Partnership CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row items-center gap-16 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full filter blur-[80px] opacity-10"></div>
                    <div className="flex-1 relative z-10">
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold tracking-wide text-xs uppercase mb-6 inline-block">For Schools</span>
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">School Partnership Program</h2>
                        <p className="text-gray-600 mb-8 text-lg">We offer comprehensive partnership programs for schools to establish after-school STEM clubs.</p>
                        <Link to='/contact' className="bg-primary text-white px-10 py-4 rounded-xl font-bold hover:shadow-lg transition-all inline-block">Contact for Partnerships</Link>
                    </div>
                    <div className="flex-1">
                        <img src={schoolpartership} alt="School partnership" className="rounded-3xl shadow-2xl w-full h-[400px] object-cover" />
                    </div>
                </div>
            </section>
        </div>
    );
}
