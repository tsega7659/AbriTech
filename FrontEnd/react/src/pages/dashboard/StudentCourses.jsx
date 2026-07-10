import React, { useState } from "react";
import { Search, BookOpen, Clock, PlayCircle, MoreVertical, Plus, User, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEnrolledCourses } from "../../hooks/useStudentQueries";
import Loading from "../../components/Loading";

export default function StudentCourses() {
    const { data: courses = [], isLoading: loading } = useEnrolledCourses();
    const [searchTerm, setSearchTerm] = useState("");


    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://abritech.onrender.com';

    if (loading) {
        return <Loading fullScreen={false} message="Fetching your courses..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                    <p className="text-gray-600 mt-1">Manage and access your enrolled courses</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        to="/courses"
                        className="flex items-center justify-center gap-2 bg-[#00B4D8] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0096B4] transition-all shadow-lg shadow-blue-100/50"
                    >
                        <Plus className="h-4 w-4" /> Find New Course
                    </Link>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none text-sm w-full sm:w-64 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

            </div>

            {filteredCourses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Found</h3>
                    <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet or no courses match your search.</p>
                    <Link to="/courses" className="inline-flex items-center gap-2 bg-[#00B4D8] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0096B4] transition-all">
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Link to={`/dashboard/student/courses/${course.id}/learn`} key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                            <div className="h-48 relative overflow-hidden">
                                <img
                                    src={course.image ? (course.image.startsWith('http') ? course.image : `${API_BASE_URL}${course.image}`) : "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=600"}
                                    alt={course.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded-lg text-xs font-bold text-gray-900">
                                    {course.level}
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{course.name}</h3>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-bold border-b border-gray-100 pb-4 flex-wrap">
                                    <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-[#FDB813]" /> {course.instructorName || 'AbriTech'}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-purple-500" /> {course.duration || 'Self-paced'}</span>
                                    {course.enrolledStudents !== undefined && (
                                        <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-[#00B4D8]" /> {course.enrolledStudents} Students</span>
                                    )}
                                </div>

                                <div className="mt-auto">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-gray-500 uppercase tracking-wider">Progress</span>
                                        <span className="text-[#00B4D8]">{course.progress || 0}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                                        <div className="h-full bg-[#00B4D8] rounded-full transition-all duration-1000" style={{ width: `${course.progress || 0}%` }}></div>
                                    </div>

                                    {course.lastAccessed && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mb-4">
                                            <Calendar className="h-3 w-3" />
                                            <span>Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                                        </div>
                                    )}

                                    <div className="block w-full text-center bg-blue-50 text-[#00B4D8] font-bold py-2.5 rounded-xl hover:bg-[#00B4D8] hover:text-white transition-colors flex items-center justify-center gap-2">
                                        <PlayCircle className="h-4 w-4" /> Continue Learning
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

