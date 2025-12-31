import React from 'react';
import {
    Users,
    BookOpen,
    Clock,
    GraduationCap,
    TrendingUp,
    CheckCircle2,
    Users2,
    MoreHorizontal,
    ArrowRight,
    User
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const miniStats = [
    { label: 'Total Students', value: '3', icon: GraduationCap, bg: 'bg-blue-50', color: 'text-blue-500' },
    { label: 'Instructors', value: '2', icon: Users, bg: 'bg-green-50', color: 'text-green-500' },
    { label: 'Courses', value: '7', icon: BookOpen, bg: 'bg-amber-50', color: 'text-amber-500' },
    { label: 'Pending Reviews', value: '1', icon: Clock, bg: 'bg-purple-50', color: 'text-purple-500' },
];

const analyticalStats = [
    {
        label: 'Total Enrollments',
        value: '6',
        change: '+12% this month',
        trend: 'up',
        icon: TrendingUp,
        iconColor: 'text-green-500'
    },
    {
        label: 'Courses Completed',
        value: '4',
        change: '67% completion rate',
        icon: CheckCircle2,
        iconColor: 'text-blue-500',
        badge: 'bg-blue-50 text-blue-600'
    },
    {
        label: 'Active Parents',
        value: '1',
        change: 'Monitoring students',
        icon: Users2,
        iconColor: 'text-orange-500',
        badge: 'bg-amber-50 text-amber-600'
    },
];

const topCoursesData = [
    { name: 'Introduction to Python...', value: 2 },
    { name: 'Robotics Fundamental...', value: 1 },
    { name: 'AI and Machine Learn...', value: 1 },
    { name: 'Digital Creativity w...', value: 1 },
    { name: 'Mobile App Developme...', value: 1 },
];

const categoryData = [
    { name: 'Coding', value: 50, color: '#3b82f6' },
    { name: 'STEM', value: 0, color: '#ef4444' },
    { name: 'Digital Creativity', value: 17, color: '#a855f7' },
    { name: 'University Prep', value: 0, color: '#f43f5e' },
    { name: 'AI & ML', value: 17, color: '#f59e0b' },
    { name: 'Robotics', value: 17, color: '#10b981' },
];

const AdminDashboard = () => {
    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Overview of your learning platform</p>
            </div>

            {/* Mini Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {miniStats.map((stat, i) => (
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

            {/* Analytical Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analyticalStats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-bold text-slate-400 mb-1">{stat.label}</p>
                                <h3 className="text-4xl font-bold text-slate-800">{stat.value}</h3>
                            </div>
                            <stat.icon className={`w-8 h-8 ${stat.iconColor} opacity-80 group-hover:scale-110 transition-transform`} />
                        </div>
                        <div className="flex items-center gap-2">
                            {stat.trend === 'up' && (
                                <div className="bg-green-50 text-green-600 p-1 rounded-md">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            )}
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${stat.badge || 'bg-green-50 text-green-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Courses */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Top Courses by Enrollment</h3>
                            <p className="text-sm text-slate-400 mt-1">Most popular courses among students</p>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCoursesData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={150}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {topCoursesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#10b981'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Enrollments by Category */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Enrollments by Category</h3>
                            <p className="text-sm text-slate-400 mt-1">Distribution of student interests</p>
                        </div>
                    </div>
                    <div className="h-[300px] flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-slate-800">Coding</span>
                            <span className="text-sm font-bold text-slate-400">50%</span>
                        </div>
                        {/* Legend placeholder */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block space-y-2">
                            {categoryData.filter(d => d.value > 0).map((d, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                    {d.name} {d.value}%
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                            <p className="text-sm text-slate-400">Latest student activities on the platform</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {[
                            { user: 'Sara Haile', action: 'lesson_started in AI and Machine Learning Basics', time: 'Dec 4, 06:10 PM', profile: 'S' },
                            { user: 'Sara Haile', action: 'Logged in', time: 'Dec 4, 06:00 PM', profile: 'S' },
                            { user: 'Abebe Kebede', action: 'Completed lesson in Robotics Fundamentals', time: 'Dec 3, 05:45 PM', profile: 'A' },
                        ].map((activity, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=${activity.user}&background=random`} alt="" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">
                                        {activity.user} <span className="font-medium text-slate-500">{activity.action}</span>
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-3 mt-4 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center justify-center gap-2">
                            View all activities <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Course Performance */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Course Performance</h3>
                        <p className="text-sm text-slate-400 mb-8">Completion rates and progress overview</p>
                    </div>
                    <div className="space-y-8">
                        {[
                            { title: 'Introduction to Python Prog...', enr: 2, comp: 0, rate: 0 },
                            { title: 'Robotics Fundamentals', enr: 1, comp: 1, rate: 100 },
                        ].map((course, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="font-bold text-slate-700">{course.title}</h4>
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{course.enr} enrolled • {course.comp} completed</p>
                                    </div>
                                    <span className="text-sm font-black text-slate-800">{course.rate}% completion</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all duration-500", course.rate > 0 ? "bg-primary" : "bg-slate-300")}
                                        style={{ width: `${course.rate || 52}%` }}
                                    />
                                </div>
                                {course.rate === 0 && <p className="text-[10px] font-bold text-slate-400 text-right">50% avg</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
