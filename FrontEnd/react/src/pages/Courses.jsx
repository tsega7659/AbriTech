import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, BookOpen, Clock, ChevronRight, Star, ArrowRight, CheckCircle2, Cpu, Code, Globe, Boxes, Laptop, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPeopleGroup, FaUsers } from "react-icons/fa6";
import Loading from "../components/Loading";
import { useAllCourses } from "../hooks/useStudentQueries";
import { useAuth } from "../context/AuthContext";
import apiClient from "../lib/apiClient";
import FeedbackModal from "../components/FeedbackModal";
import TelebirrPaymentModal from "../components/TelebirrPaymentModal";
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
    const [paymentModal, setPaymentModal] = useState({ isOpen: false, courseId: null });

    const showFeedback = useCallback((title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    }, []);

    const closeFeedback = useCallback(() => {
        setFeedbackModal(prev => ({ ...prev, isOpen: false }));
    }, []);

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

    const handleEnroll = async (course) => {
        if (!user) {
            navigate('/auth/get-started');
            return;
        }

        setEnrolling(course.id);
        try {
            await apiClient.post('/courses/enroll', { courseId: course.id });
            setEnrollSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/student');
            }, 2000);
        } catch (error) {
            // Already enrolled
            if (error.response?.status === 400) {
                navigate('/dashboard/student');
                return;
            }
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
                        className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight px-2"
                    >
                        Explore Our <span className="text-primary">STEM Universe</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto font-medium px-4"
                    >
                        Comprehensive curriculum covering robotics, mechatronics, programming, and the Internet of Things suitable for all ages.
                    </motion.p>

                    {/* Search and Filters */}
                    <div className="mt-12 max-w-5xl mx-auto space-y-6">
                        <div className="bg-white p-2 rounded-3xl shadow-xl shadow-gray-200/50  border border-[#00B4D8] flex flex-col md:flex-row gap-2">
                            <div className="relative flex-1 ">
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
                                            ? "bg-primary text-gray-800 border-primary shadow-lg shadow-primary/20"
                                            : "bg-white text-gray-500 border-gray-100  hover:border-gray-300"
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
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <AnimatePresence mode="wait">
                    {filteredCourses.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredCourses.map((course) => (
                                <motion.div
                                    layout
                                    key={course.id}
                                    className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={course.image ? (course.image.startsWith('http') ? course.image : `${API_BASE_URL}${course.image}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                                            alt={course.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-900 shadow-sm border border-white/50">
                                                {course.category}
                                            </span>
                                            {course.hasScholarship && (
                                                <span className="bg-[#FDB813]/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-900 shadow-sm border-[#FDB813]/50">
                                                    Scholarship
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="text-xl font-black text-gray-900 mb-1.5 group-hover:text-primary transition-colors leading-tight truncate">
                                            {course.name}
                                        </h3>
                                        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
                                            {course.description}
                                        </p>

                                        <div className="mt-auto space-y-4">
                                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        <Clock className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-0.5">Duration</p>
                                                        <p className="text-xs font-bold text-gray-700">{course.duration || 'Self-Paced'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-[#FDB813]/10 flex items-center justify-center text-[#FDB813]">
                                                        <Users className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-0.5">Enrolled</p>
                                                        <p className="text-xs font-bold text-gray-700">{course.enrolledStudents || 0}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                        Level: <span className="text-gray-900 ml-1">{course.level === 'advanced' ? 'All Levels' : (course.level?.toUpperCase())}</span>
                                                    </div>
                                                    {course.isFree ? (
                                                        <div className="text-lg font-black text-[#FDB813]">
                                                            Freemium
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg font-black text-gray-900">{course.hasDiscount ? course.discountPrice : course.price} ETB</span>
                                                                {course.hasDiscount && (
                                                                    <span className="text-xs font-bold text-gray-400 line-through">{course.price}</span>
                                                                )}
                                                            </div>
                                                            <div className="bg-[#FDB813]/10 text-[#FDB813] px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter w-fit">
                                                                {course.level?.toLowerCase() === 'advanced' ? 'Full Access' : 'Free Preview Inc.'}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {user && user.role === 'student' ? (
                                                <button
                                                    onClick={() => handleEnroll(course)}
                                                    disabled={enrolling === course.id}
                                                    className="w-full py-3.5 bg-[#00B4D8] text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-blue-500/20 hover:bg-[#0096B4] hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                                >
                                                    {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                                                </button>
                                            ) : (
                                                <Link to="/auth/get-started" className="block w-full text-center bg-[#00B4D8] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#0096B4] transition-all shadow-lg shadow-blue-500/20">
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

            <TelebirrPaymentModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ isOpen: false, courseId: null })}
                courseId={paymentModal.courseId}
                onSuccess={() => {
                    setPaymentModal({ isOpen: false, courseId: null });
                    setEnrollSuccess(true);
                    setTimeout(() => navigate('/dashboard/student'), 2000);
                }}
            />

            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={closeFeedback}
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
