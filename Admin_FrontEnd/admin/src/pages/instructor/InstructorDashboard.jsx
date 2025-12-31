import React from 'react';
import { BookOpen, Users, Clock, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

const InstructorDashboard = () => {
    const stats = [
        { label: 'My Courses', value: '2', icon: BookOpen, bg: 'bg-blue-50', color: 'text-blue-500' },
        { label: 'Total Students', value: '2', icon: Users, bg: 'bg-green-50', color: 'text-green-500' },
        { label: 'Pending Reviews', value: '0', icon: Clock, bg: 'bg-amber-50', color: 'text-amber-500' },
        { label: 'Completions', value: '1', icon: TrendingUp, bg: 'bg-purple-50', color: 'text-purple-500' },
    ];

    const myCourses = [
        { title: 'Introduction to Python Programming', enrolled: 2, completion: 0 },
        { title: 'Mobile App Development with React Native', enrolled: 1, completion: 100 },
    ];

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Welcome, Dr. Tadesse Bekele</h1>
                <p className="text-slate-500 text-sm mt-1">Here's an overview of your courses and students</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                            <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Project Reviews */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Pending Project Reviews</h3>
                                <p className="text-xs text-slate-400 font-bold">Projects waiting for your approval</p>
                            </div>
                        </div>
                        <button className="text-sm font-bold text-primary hover:underline">View All</button>
                    </div>

                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <p className="text-lg font-bold text-slate-800">No pending reviews</p>
                    </div>
                </div>

                {/* My Courses */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">My Courses</h3>
                            <p className="text-xs text-slate-400 font-bold">Courses you're teaching</p>
                        </div>
                        <button className="text-sm font-bold text-primary hover:underline">View All</button>
                    </div>

                    <div className="space-y-6">
                        {myCourses.map((course, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{course.title}</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-0.5">{course.enrolled} students enrolled</p>
                                    </div>
                                    <span className="text-xs font-black text-slate-800">{course.completion}% completion</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${course.completion > 0 ? 'bg-primary' : 'bg-slate-300'}`}
                                        style={{ width: `${course.completion || 50}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;
