import { ArrowRight, Star, Filter, CheckCircle2, Code, Cpu, Globe, Boxes, Layers } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";

const allCourses = [
    {
        title: "Arduino Programming",
        category: "STEM",
        level: "Beginner",
        description: "Age-based curriculum helping students bring innovative ideas to life through microcontroller programming and electronics.",
        image: "https://images.unsplash.com/photo-1555676105-06d51bb7e053?auto=format&fit=crop&q=80&w=800",
        rating: 4.8,
        students: 120,
    },
    {
        title: "Robotics",
        category: "Robotics",
        level: "All Levels",
        description: "Comprehensive robotics course classified into different stages and ages, from basic to advanced robotics systems.",
        image: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&q=80&w=800",
        rating: 4.9,
        students: 250,
    },
    {
        title: "3D Modeling & CAD",
        category: "3D Design",
        level: "Intermediate",
        description: "Computer software training to create 3D designs for product visualization and 3D printing applications.",
        image: "https://images.unsplash.com/photo-1615840287214-7ff58ee048e9?auto=format&fit=crop&q=80&w=800",
        rating: 4.7,
        students: 85,
    },
    {
        title: "IoT Development",
        category: "STEM",
        level: "Advanced",
        description: "Create connected devices and smart systems using Arduino and modern IoT technologies for real-world applications.",
        image: "https://plus.unsplash.com/premium_photo-1663089688180-444ff0066e5d?auto=format&fit=crop&q=80&w=800",
        rating: 4.6,
        students: 45,
    },
    {
        title: "Python Programming",
        category: "Programming",
        level: "Beginner",
        description: "Learn the fundamentals of programming with Python, focusing on problem-solving and computational thinking.",
        image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=800",
        rating: 4.8,
        students: 300,
    },
    {
        title: "Web Development",
        category: "Programming",
        level: "Intermediate",
        description: "Build modern websites and web applications using HTML, CSS, JavaScript, and popular frameworks.",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800",
        rating: 4.7,
        students: 180,
    }
];

const categories = [
    { name: "All", icon: Filter },
    { name: "STEM", icon: Code },
    { name: "Robotics", icon: Cpu },
    { name: "Programming", icon: Globe },
    { name: "3D Design", icon: Boxes }
];
const levels = ["All", "Beginner", "Intermediate", "Advanced", "All Levels"];

export default function Courses() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLevel, setSelectedLevel] = useState("All");

    const filteredCourses = allCourses.filter(course => {
        const categoryMatch = selectedCategory === "All" || course.category === selectedCategory;
        const levelMatch = selectedLevel === "All" || course.level === selectedLevel;
        return categoryMatch && levelMatch;
    });

    return (
        <div className="bg-white pb-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
                <div className="w-[800px] h-[800px] bg-[#00B4D8] rounded-full opacity-5 blur-3xl"></div>
            </div>
            <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4">
                <div className="w-[600px] h-[600px] bg-[#FDB813] rounded-full opacity-5 blur-3xl"></div>
            </div>
            {/* Header */}
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
                            {/* Category Filter - Glassmorphic Pill Container */}
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

                            {/* Level Filter - Simple modern pills */}
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
                        <AnimatePresence mode="popLayout">
                            {filteredCourses.map((course, index) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    key={course.title} // Use title as key for animation continuity
                                    className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60"></div>
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <span className="bg-[#FDB813]/70 border-[#FDB813]  text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                                                {course.category}
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-900 flex items-center gap-1 shadow-sm">
                                            <Star className="h-3 w-3 fill-[#FDB813] text-[#FDB813]" /> {course.rating}
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#00B4D8] transition-colors">{course.title}</h3>
                                        <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                                            {course.description}
                                        </p>

                                        <div className="pt-6 border-t border-gray-50 w-full mt-auto flex items-center justify-between gap-4">
                                            <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                                                {course.level}
                                            </div>
                                            <Link to="/auth/get-started" className="flex-1 bg-[#00B4D8] text-white py-3 rounded-xl font-bold hover:bg-[#0096B4] transition-all flex items-center justify-center shadow-lg shadow-[#00B4D8]/20 hover:-translate-y-0.5">
                                                Enroll Now
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
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

                        <button className="bg-[#00B4D8] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#0096B4] transition-all shadow-lg hover:shadow-[#00B4D8]/20 hover:-translate-y-1">
                            Contact for Partnerships
                        </button>
                    </div>
                    <div className="flex-1 w-full relative order-1 md:order-2">
                        <div className="absolute inset-0 bg-[#FDB813] rounded-3xl transform rotate-3 translate-x-2 translate-y-2 -z-10 opacity-20"></div>
                        <img
                            src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=800"
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
        </div>
    );
}
