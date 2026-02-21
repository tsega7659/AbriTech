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
    User,
    Loader2
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

import {
    useAdminDashboardStats,
    useTeachers,
    useStudentsList,
    useAdminCourses,
    useAdminBlogs,
    useParents
} from '../../hooks/useAdminQueries';

const AdminDashboard = () => {
    const { data: adminDashboardStats, isLoading: statsLoading } = useAdminDashboardStats();
    const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
    const { data: students = [], isLoading: studentsLoading } = useStudentsList();
    const { data: courses = [], isLoading: coursesLoading } = useAdminCourses();
    const { data: blogs = [], isLoading: blogsLoading } = useAdminBlogs();
    const { data: parents = [], isLoading: parentsLoading } = useParents();

    const loading = statsLoading || teachersLoading || studentsLoading || coursesLoading || blogsLoading || parentsLoading;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const miniStats = [
        { label: 'Total Students', value: students.length.toString(), icon: GraduationCap, bg: 'bg-blue-50', color: 'text-blue-500' },
        { label: 'Instructors', value: teachers.length.toString(), icon: Users, bg: 'bg-green-50', color: 'text-green-500' },
        { label: 'Courses', value: courses.length.toString(), icon: BookOpen, bg: 'bg-amber-50', color: 'text-amber-500' },
        { label: 'Pending Reviews', value: adminDashboardStats?.pendingReviews?.toString() || '0', icon: Clock, bg: 'bg-purple-50', color: 'text-purple-500' },
    ];

    const analyticalStats = [
        {
            label: 'Total Enrollments',
            value: adminDashboardStats?.totalEnrollments?.toString() || '0',
            change: adminDashboardStats?.enrollmentChange || '+0% this month',
            trend: adminDashboardStats?.enrollmentChange?.includes('+') ? 'up' : 'down',
            icon: TrendingUp,
            iconColor: 'text-green-500'
        },
        {
            label: 'Courses Completed',
            value: (adminDashboardStats?.totalEnrollments && adminDashboardStats?.completionRate)
                ? Math.round((parseInt(adminDashboardStats.completionRate) / 100) * adminDashboardStats.totalEnrollments).toString()
                : '0',
            change: adminDashboardStats?.completionRate || '0% completion rate',
            icon: CheckCircle2,
            iconColor: 'text-blue-500',
            badge: 'bg-blue-50 text-blue-600'
        },
        {
            label: 'Active Parents',
            value: parents.length.toString(),
            change: 'Monitoring students',
            icon: Users2,
            iconColor: 'text-orange-500',
            badge: 'bg-amber-50 text-amber-600'
        },
    ];

    const topCoursesData = adminDashboardStats?.topCourses || [];

    const categoryData = adminDashboardStats?.categoryStats || [];

    if (loading && !adminDashboardStats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

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
                        {categoryData.length === 0 ? (
                            <div className="text-slate-400 text-sm">No course categories yet</div>
                        ) : (
                            <>
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
                                        <Tooltip
                                            formatter={(value) => [`${value} Courses`, 'Enrollments']}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xl font-bold text-slate-800">
                                        {courses.length}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Courses</span>
                                </div>
                                {/* Legend */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block space-y-2 max-h-full overflow-y-auto px-2">
                                    {categoryData.filter(d => d.value > 0).map((d, i) => {
                                        const percentage = Math.round((d.value / courses.length) * 100);
                                        return (
                                            <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                                                <span className="truncate max-w-[100px]">{d.name}</span>
                                                <span className="text-slate-400 ml-auto">{percentage}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
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
                        {(!adminDashboardStats?.recentActivity || adminDashboardStats.recentActivity.length === 0) ? (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No recent activity found</p>
                            </div>
                        ) : (
                            adminDashboardStats.recentActivity.map((activity, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=random`} alt="" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">
                                            {activity.user} <span className="font-medium text-slate-500">{activity.action}</span>
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{formatDate(activity.time)}</p>
                                    </div>
                                </div>
                            ))
                        )}
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
                        {(!adminDashboardStats?.coursePerformance || adminDashboardStats.coursePerformance.length === 0) ? (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No course performance data available</p>
                            </div>
                        ) : (
                            adminDashboardStats.coursePerformance.map((course, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h4 className="font-bold text-slate-700 truncate max-w-[200px]">{course.title}</h4>
                                            <p className="text-[11px] font-bold text-slate-400 mt-0.5">{course.enr} enrolled • {course.comp} completed</p>
                                        </div>
                                        <span className="text-sm font-black text-slate-800">{course.rate}% completion</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-500", parseFloat(course.rate) > 0 ? "bg-primary" : "bg-slate-300")}
                                            style={{ width: `${course.rate}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
