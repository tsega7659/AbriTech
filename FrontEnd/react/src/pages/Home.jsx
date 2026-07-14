import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock, Users, Shield, Cpu, ShieldAlert, } from "lucide-react";
import { motion } from "framer-motion";
import { FaPeopleGroup } from "react-icons/fa6";
import hero from "../assets/hero.jpg"
import whyabri from "../assets/whyabri.jpg"

// ... imports
import { useState, useEffect } from "react";
import Loading from "../components/Loading";

import { useAllCourses } from "../hooks/useStudentQueries";
import apiClient from "../lib/apiClient";
import { cn } from "../lib/utils";

const API_BASE_URL = apiClient.defaults.baseURL.replace('/api', '');

const features = [
    {
        title: "Structured Curriculum",
        description: "Age-targeted, project-based learning approach with locally relevant curriculum designed for Ethiopian students.",
        icon: BookOpen,
    },
    {
        title: "Expert Instructors",
        description: "Our team of skilled engineers and educators provide expert guidance and mentorship throughout the learning journey.",
        icon: Users,
    },
    {
        title: "Hybrid Learning",
        description: "Flexible delivery through in-school, after-school, online, and summer camp programs to suit every student's needs.",
        icon: Clock,
    },
    {
        title: "Practical Projects",
        description: "Hands-on robotics and tech skills development through real-world projects and innovative problem-solving.",
        icon: Cpu,
    },
];

// Removed static popularCourses

export default function Home() {
    const { data: allCourses = [], isLoading: loading } = useAllCourses();
    const courses = allCourses.slice(0, 3);

    return (
        <div className="flex flex-col gap-20 pb-20">
            {/* Hero Section */}
            <section className="relative bg-white pt-20 pb-24 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
                    <div className="w-[800px] h-[800px] bg-[#00B4D8] rounded-full opacity-5 blur-3xl"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-8"
                        >
                            {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00B4D8]/10 text-sm font-bold text-[#00B4D8] border border-[#00B4D8]/20">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B4D8] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00B4D8]"></span>
                                </span>
                                Connecting Education to Innovation
                            </div> */}

                            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                                Transforming <br />
                                <span className="text-[#00B4D8]">STEM Education</span>
                                <br /> in Ethiopia
                            </h1>

                            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                                At AbriTech, we provide world-class education integrated with technology solutions, fostering practical skills in Robotics, Coding, AI, and Digital Creativity for students ages 8-18.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/courses" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-[#00B4D8] rounded-full hover:bg-[#0096B4] transition-all shadow-lg hover:shadow-xl hover:shadow-[#00B4D8]/20 hover:-translate-y-1">
                                    Explore Courses
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link to="/about" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-700 bg-white border-2 border-gray-100 rounded-full hover:border-[#FDB813] hover:text-[#FDB813] transition-all hover:-translate-y-1">
                                    Learn More
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-[#FDB813] rounded-[2.5rem] transform rotate-3 translate-x-2 translate-y-2 -z-10 opacity-40"></div>

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-[#00B4D8] via-[#FDB813] to-[#00B4D8] blur-[100px] opacity-80 -z-20"></div>

                            <img
                                src={hero}
                                alt="Students learning STEM"
                                className="rounded-[2.5rem] shadow-2xl object-cover h-[600px] w-full border-4 border-white relative z-10 filter drop-shadow-[0_0_50px_rgba(0,180,216,0.5)]"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">What Makes Us Unique</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Our innovative approach to STEM education combines local relevance with global standards.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="bg-[#00B4D8]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00B4D8] transition-colors duration-300">
                                <feature.icon className="h-7 w-7 text-[#00B4D8] group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Why Choose AbriTech */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="flex flex-col justify-center">
                            <h2 className="text-4xl lg:text-4xl font-bold text-gray-900 mb-8">Why Choose AbriTech?</h2>
                            <p className="text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed">
                                We're committed to transforming STEM education in Ethiopia through innovative teaching methods and hands-on learning experiences that prepare students for the future.
                            </p>

                            <div className="space-y-8">
                                {[
                                    { title: "Innovation-Focused", desc: "Cutting-edge curriculum that encourages creative problem-solving and technological innovation." },
                                    { title: "Expert Instructors", desc: "Learn from experienced professionals who are passionate about STEM education and student success." },
                                    { title: "Proven Results", desc: "Track record of helping students excel in STEM fields and pursue successful careers in technology." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 group">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-10 h-10 rounded-full bg-[#00B4D8]/10 flex items-center justify-center text-[#00B4D8] font-bold text-base group-hover:bg-[#00B4D8] group-hover:text-white transition-all">
                                                {i + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#00B4D8] transition-colors">{item.title}</h3>
                                            <p className="text-gray-600 text-base leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/10 rounded-3xl transform rotate-3"></div>
                            <img
                                src={whyabri}
                                alt="Innovation Class"
                                className="relative rounded-3xl shadow-xl hover:shadow-2xl transition-all"
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section className="py- bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">How It Works</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Start your STEM journey with AbriTech in three simple steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-[#00B4D8] to-gray-200 -z-10"></div>

                        {[
                            { step: "01", title: "Create Account", desc: "Sign up as a student or parent to access our learning platform." },
                            { step: "02", title: "Choose Courses", desc: "Browse our catalog and enroll in courses that spark your interest." },
                            { step: "03", title: "Start Learning", desc: "Access lessons, projects, and live sessions immediately." }
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-[#00B4D8]/10 flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                                    <div className="w-20 h-20 rounded-full bg-[#00B4D8] flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ready to Start - Inspired by User Request */}
            {/* Ready to Start */}
            <section className="bg-[#00B4D8] py-24 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to Start Your Learning Journey?</h2>
                    <p className="text-white/95 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of Ethiopian students discovering their potential through our hands-on STEM education programs.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link to="/auth/login" className="bg-white text-[#00B4D8] font-bold px-10 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3">
                            <Users className="h-5 w-5" /> Student Portal
                        </Link>
                        <Link to="/auth/login" className="bg-transparent border-2 border-white text-white font-bold px-10 py-4 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                            <Shield className="h-5 w-5" /> Parent Portal
                        </Link>
                    </div>
                </div>
            </section>

            {/* Popular Courses Section */}
            <section className="lg:max-w-7xl lg:mx-32 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Popular Courses</h2>
                        <p className="text-gray-600">Discover our comprehensive STEM and robotics programs</p>
                    </div>
                    <Link to="/courses" className="hidden md:flex text-primary font-medium items-center hover:translate-x-1 transition-transform">
                        View All Courses <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>

                <div className="min-h-[300px]">
                    {loading ? (
                        <Loading fullScreen={false} message="Loading popular courses..." />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                            {courses.map((course, index) => (
                                <Link to="/courses" key={index} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full text-left">
                                    <div className="relative h-28 sm:h-36 overflow-hidden bg-gray-50">
                                        <img
                                            src={course.image ? (course.image.startsWith('http') ? course.image : `${API_BASE_URL.replace('/api', '')}${course.image}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                                            alt={course.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                            <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#00B4D8] shadow-sm border border-gray-100">
                                                {course.category || 'Course'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                                        <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors leading-tight">
                                            {course.name}
                                        </h3>
                                        <p className="text-gray-400 text-[11px] leading-relaxed mb-3 line-clamp-2">
                                            {course.description}
                                        </p>

                                        <div className="mt-auto space-y-4 sm:space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex gap-2.5 items-start">
                                                    <Clock className="w-4 h-4 text-gray-600 mt-0.5" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Duration</span>
                                                        <span className="text-xs font-bold text-gray-900">{course.duration || 'Self-Paced'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2.5 items-start">
                                                    <FaPeopleGroup className="w-4 h-4 text-[#FDB813] mt-0.5" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Enrolled</span>
                                                        <span className="text-xs font-bold text-gray-900">{course.enrolledStudents || 0}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2.5 items-start">
                                                    <BookOpen className="w-4 h-4 text-purple-500 mt-0.5" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Lessons</span>
                                                        <span className="text-xs font-bold text-gray-900">{course.lessonCount || 0} Modules</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2.5 items-start">
                                                    <ShieldAlert className={cn("w-4 h-4 mt-0.5", course.isFree ? "text-green-500" : "text-amber-500")} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment</span>
                                                        <span className={cn("text-xs font-bold", course.isFree ? "text-green-600" : "text-amber-600")}>
                                                            {course.isFree ? 'Free Access' : 'Paid Course'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Level: <span className="text-gray-900">{course.level === 'advanced' ? 'All Levels' : (course.level?.toUpperCase() || 'BEGINNER')}</span>
                                                </p>
                                                {course.isFree ? (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-lg font-black text-green-600">Free Course</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-black text-gray-900">
                                                                {course.hasDiscount ? course.discountPrice : course.price} ETB
                                                            </span>
                                                            {course.hasDiscount && (
                                                                <span className="text-sm text-gray-400 line-through font-bold">
                                                                    {course.price} ETB
                                                                </span>
                                                            )}
                                                        </div>
                                                        {course.hasDiscount && (
                                                            <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider border border-red-100 shadow-sm animate-pulse">
                                                                Hurry! {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-black uppercase tracking-widest">Free Preview Inc.</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="block w-full text-center bg-[#00B4D8] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#0096B4] transition-all">
                                                View Course
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 text-center md:hidden">
                        <span className="btn-primary w-full">
                            View All Courses
                        </span>
                    </div>
                </div>
            </section>
        </div>

    );
}
