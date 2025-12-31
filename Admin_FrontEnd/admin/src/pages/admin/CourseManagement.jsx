import React, { useState } from 'react';
import {
    Search,
    Plus,
    Users,
    MoreHorizontal,
    LayoutGrid,
    List
} from 'lucide-react';

const courses = [
    {
        id: 1,
        title: 'Introduction to Python Programming',
        instructor: 'Dr. Tadesse Bekele',
        category: 'Coding',
        enrollments: 2,
        completionRate: 0,
        level: 'Beginner'
    },
    {
        id: 2,
        title: 'Robotics Fundamentals',
        instructor: 'Eng. Meron Assefa',
        category: 'Robotics',
        enrollments: 1,
        completionRate: 100,
        level: 'Intermediate'
    },
    {
        id: 3,
        title: 'AI and Machine Learning Basics',
        instructor: 'Dr. Yonas Tesfaye',
        category: 'AI & ML',
        enrollments: 1,
        completionRate: 100,
        level: 'Intermediate'
    },
    {
        id: 4,
        title: 'University Readiness Program',
        instructor: 'Prof. Helen Girma',
        category: 'University Prep',
        enrollments: 0,
        completionRate: 0,
        level: 'Advanced'
    },
    {
        id: 5,
        title: 'Digital Creativity with Canva',
        instructor: 'Hana Solomon',
        category: 'Digital Creativity',
        enrollments: 1,
        completionRate: 100,
        level: 'Beginner'
    },
];

const CourseManagement = () => {
    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Courses</h1>
                    <p className="text-slate-500 text-sm font-semibold">Manage all courses and content</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95">
                    <Plus className="w-5 h-5" /> Add New Course
                </button>
            </div>

            {/* Search Bar Area */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search courses by title or instructor..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium text-slate-700"
                    />
                </div>
            </div>

            {/* Course Table Area */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-extrabold text-slate-800">All Courses ({courses.length})</h3>
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
                            <button className="p-2 bg-white text-primary rounded-lg shadow-sm"><List className="w-4 h-4" /></button>
                            <button className="p-2 text-slate-400 hover:text-slate-600"><LayoutGrid className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">View and manage course content</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Course</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Category</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Enrollments</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Completion Rate</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Level</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="font-bold text-slate-800 group-hover:text-primary transition-colors text-sm">{course.title}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1">{course.instructor}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ring-1 ring-inset ${course.category === 'Coding' ? 'bg-blue-50 text-blue-600 ring-blue-100' :
                                                course.category === 'Robotics' ? 'bg-orange-50 text-orange-600 ring-orange-100' :
                                                    course.category === 'AI & ML' ? 'bg-purple-50 text-purple-600 ring-purple-100' :
                                                        course.category === 'University Prep' ? 'bg-amber-50 text-amber-600 ring-amber-100' :
                                                            'bg-pink-50 text-pink-600 ring-pink-100'
                                            }`}>
                                            {course.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            {course.enrollments} students
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 w-64">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 rounded-full ${course.completionRate > 0 ? 'bg-primary' : 'bg-slate-200'}`}
                                                    style={{ width: `${course.completionRate || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-800 w-10">{course.completionRate}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-4 py-1 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-[11px] font-black uppercase tracking-tight">
                                            {course.level}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CourseManagement;
