import { ArrowRight, Star, Filter, CheckCircle2, Code, Cpu, Globe, Boxes, Layers, Clock, Laptop } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { useNavigate, Link } from "react-router-dom";

import schoolpartership from "../assets/schoolpartner.jpg";
import { FaPeopleGroup, FaPeopleLine } from "react-icons/fa6";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import FeedbackModal from "../components/FeedbackModal";

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://abritech.onrender.com/api';

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
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLevel, setSelectedLevel] = useState("All");
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const [enrollSuccess, setEnrollSuccess] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/courses`);
                if (response.ok) {
                    const data = await response.json();
                    setAllCourses(data);
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleEnroll = async (courseId) => {
        if (!user) {
            navigate('/auth/get-started');
            return;
        }

        setEnrolling(courseId);
        try {
            await api.post('/courses/enroll', { courseId });
            setEnrollSuccess(true);

            // Wait a moment for visual confirmation before redirecting
            setTimeout(() => {
                navigate('/dashboard/student');
            }, 2000);
        } catch (error) {
            console.error("Failed to enroll:", error);
            showFeedback("Enrollment Failed", error.response?.data?.message || 'Failed to enroll in course', "error");
            setEnrolling(null);
        }
    };


    const filteredCourses = allCourses.filter(course => {
        const categoryMatch = selectedCategory === "All" || course.category === selectedCategory;
        // Map 'all levels' filter to 'advanced' database value or 'all_levels' if we had it.
        // Also if we display "All Levels", we should match it.
        // User logic: Advanced -> All Levels.
        // So if filter is "All Levels", we accept course.level === 'advanced'.
        // If filter is "Advanced", we remove it from options.

        let normalizedCourseLevel = course.level;
        if (normalizedCourseLevel === 'advanced') normalizedCourseLevel = 'All Levels';
        // Capitalize others
        normalizedCourseLevel = normalizedCourseLevel.charAt(0).toUpperCase() + normalizedCourseLevel.slice(1);

        const levelMatch = selectedLevel === "All" || normalizedCourseLevel === selectedLevel;
        return categoryMatch && levelMatch;
    });

    return (
        <div className="bg-white pb-20 relative overflow-hidden">
            {/* ... Background and Header ... */}
            {/* Keep existing Header section code but I'll skip re-writing it in replacement if not needed, however
                I need to replace the whole initial block to remove allCourses static data. 
                I will include the header in the StartLine/EndLine range or just the top part.
            */}
            <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
                <div className="w-[800px] h-[800px] bg-[#00B4D8] rounded-full opacity-5 blur-3xl"></div>
            </div>
            {/* ... skipped lines 92-110 ... */}
            <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4">
                <div className="w-[600px] h-[600px] bg-[#FDB813] rounded-full opacity-5 blur-3xl"></div>
            </div>
            <section className="bg-gray-50 py-20 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 -z-10 opacity-5">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-[600px] w-[600px] fill-[#00B4D8]">
                        <path transform="translate(100 100)" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.4,82.2,23.1,70.8,34.5C59.4,45.9,47.9,55,35.6,63.1C23.3,71.2,10.2,78.3,-2,81.8C-14.2,85.3,-25.5,85.2,-35.1,79.5C-44.7,73.8,-52.6,62.5,-61.8,51.7C-71,40.9,-81.5,30.6,-86.3,17.8C-91.1,5,-90.2,-10.3,-83.1,-23.4C-76,-36.5,-62.7,-47.4,-49.6,-55.1C-36.5,-62.8,-23.6,-67.3,-10.5,-69.7C2.6,-72.1,15.7,-72.4,30.5,-83.6L44.7,-76.4Z" />
                    </svg>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <span className="text-[#00B4D8] font-bold tracking-wider text-sm uppercase mb-4 block">Our Programs</span>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">Expand Your Knowledge</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Comprehensive curriculum covering robotics, mechatronics, programming, and the Internet of Things suitable for all ages.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Courses Grid */}
                <div className="mb-24">
                    <div className="flex flex-col xl:flex-row justify-between items-start mb-12 gap-8">
                        <div className="mb-6 xl:mb-0">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Courses</h2>
                            <p className="text-gray-600 max-w-xl text-lg">Explore our wide range of courses designed to ignite curiosity.</p>
                        </div>

                        {/* Fancy Filters */}
                        <div className="flex flex-col gap-6 w-full xl:w-auto">
                            {/* Category Filter */}
                            <div className="bg-gray-100/50 backdrop-blur-sm p-1.5 rounded-2xl flex flex-wrap gap-1 border border-gray-200 w-fit">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.name}
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={cn(
                                            "relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 z-10",
                                            selectedCategory === cat.name ? "text-[#00B4D8]" : "text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        {selectedCategory === cat.name && (
                                            <motion.div
                                                layout
                                                layoutId="activeCategory"
                                                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-100 -z-10"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <cat.icon className="h-4 w-4 text-primary" />
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* Level Filter */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Filter by Level:</span>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            <div className="col-span-full py-12">
                                <Loading fullScreen={false} message="Loading courses..." />
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredCourses.map((course, index) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        key={course.id || index}
                                        className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
                                    >
                                        <div className="relative h-64 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60"></div>
                                            <img
                                                src={course.image ? (course.image.startsWith('http') ? course.image : `${API_BASE_URL.replace('/api', '')}${course.image}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                                                alt={course.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute bottom-4 left-4 z-20">
                                                <span className="bg-[#FDB813]/70 border-[#FDB813] text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                                                    {course.category}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-8 flex flex-col flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#00B4D8] transition-colors">{course.name}</h3>
                                            <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                                                {course.description}
                                            </p>
                                            <div className="flex justify-between">
                                                <div>
                                                    <Clock className="inline-block h-4 w-4 text-gray-400 mr-1" />
                                                    <span className="text-gray-500 text-sm">Flexible</span>
                                                </div>
                                                <div>
                                                    <FaPeopleGroup className="inline-block h-4 w-4 text-gray-400 mr-1" />
                                                    <span className="text-gray-500 text-sm">Open</span>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-50 w-full mt-auto flex items-center justify-between gap-4">
                                                <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                                                    {course.level === 'advanced' ? 'All Levels' : course.level}
                                                </div>
                                                {user && user.role === 'student' ? (
                                                    <button
                                                        onClick={() => handleEnroll(course.id)}
                                                        disabled={enrolling === course.id}
                                                        className="flex-1 bg-[#00B4D8] text-white py-3 rounded-xl font-bold hover:bg-[#0096B4] transition-all flex items-center justify-center shadow-lg shadow-[#00B4D8]/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                                                    </button>
                                                ) : (
                                                    <Link to="/auth/get-started" className="flex-1 bg-[#00B4D8] text-white py-3 rounded-xl font-bold hover:bg-[#0096B4] transition-all flex items-center justify-center shadow-lg shadow-[#00B4D8]/20 hover:-translate-y-0.5">
                                                        Enroll Now
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* School Partnership Program - Move DOWN as requested */}
                <div className="bg-white rounded-3xl p-8 md:p-12 mb-24 flex flex-col md:flex-row items-center gap-16 border border-gray-100 shadow-xl shadow-gray-100/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8] rounded-full filter blur-[80px] opacity-10 font-bold"></div>
                    <div className="flex-1 order-2 md:order-1 relative z-10">
                        <span className="bg-[#00B4D8]/10 text-[#00B4D8] px-4 py-1.5 rounded-full font-bold tracking-wide text-xs uppercase mb-6 inline-block">For Schools</span>
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">School Partnership Program</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                            We offer comprehensive partnership programs for schools to establish after-school STEM clubs and robotics programs. Our packages include:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-10">
                            {['Curriculum Materials', 'Expert Trainers', 'Equipment & Kits', 'Ongoing Support'].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <div className="bg-green-100 p-1.5 rounded-full">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <span className="text-base font-medium text-gray-700">{item}</span>
                                </div>
                            ))}
                        </div>

                        <Link to='/contact' className="bg-[#00B4D8] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#0096B4] transition-all shadow-lg hover:shadow-[#00B4D8]/20 hover:-translate-y-1">
                            Contact for Partnerships
                        </Link>
                    </div>
                    <div className="flex-1 w-full relative order-1 md:order-2">
                        <div className="absolute inset-0 bg-[#FDB813] rounded-3xl transform rotate-3 translate-x-2 translate-y-2 -z-10 opacity-20"></div>
                        <img
                            src={schoolpartership}
                            alt="Students collaborating"
                            className="rounded-3xl shadow-2xl w-full h-[400px] object-cover"
                        />
                    </div>
                </div>

                {/* Engineering Projects */}
                <div className="bg-gray-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden mb-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8] rounded-full filter blur-[100px] opacity-20"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-6">Engineering Projects</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
                            Our team of skilled engineers creates, innovates, and delivers engineering solutions across various sectors. We combine theoretical knowledge with practical application to solve real-world challenges.
                        </p>
                        {/* <Link to="/courses" className="bg-white text-gray-900 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl hover:-translate-y-1">
                            Learn More About Our Projects
                        </Link> */}
                    </div>
                </div>
            </div>
            {/* Enrollment Overlays */}
            <AnimatePresence>
                {enrolling && !enrollSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[2.5rem] p-12 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2, ease: "linear" }}
                                    className="h-full bg-[#00B4D8]"
                                />
                            </div>
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-[#00B4D8] mx-auto animate-bounce">
                                <Cpu className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Processing</h3>
                                <p className="text-gray-500 font-medium">Setting up your learning path...</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {enrollSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-[#00B4D8] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-center space-y-8"
                        >
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mx-auto shadow-2xl relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                >
                                    <CheckCircle2 className="h-12 w-12" />
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 border-4 border-white rounded-full"
                                />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Welcome Aboard!</h2>
                                <p className="text-blue-50 font-bold text-xl opacity-80">You've successfully enrolled in the course.</p>
                            </div>
                        </motion.div>
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
        </div>
    );
}

