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
    Loader2,
    DollarSign,
    Zap,
    Trophy,
    ShieldAlert,
    BarChart3,
    Activity,
    UserCheck,
    HelpCircle,
    Heart
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
import Loading from '../../components/Loading';

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
        {
            label: 'Total Revenue',
            value: adminDashboardStats?.totalRevenue ? `${adminDashboardStats.totalRevenue} ETB` : '0 ETB',
            change: adminDashboardStats?.monthlyRecurringRevenue ? `${adminDashboardStats.monthlyRecurringRevenue} ETB MRR` : 'Calculating MRR...',
            icon: DollarSign,
            iconColor: 'text-emerald-500',
            badge: 'bg-emerald-50 text-emerald-600'
        },
    ];

    const growthMetrics = [
        { label: 'New Students (7d)', value: adminDashboardStats?.newRegistrationsThisWeek?.toString() || '0', icon: User, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Enrollments (Today)', value: adminDashboardStats?.newEnrollmentsToday?.toString() || '0', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Active Today', value: adminDashboardStats?.activeUsersToday?.toString() || '0', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'MRR', value: adminDashboardStats?.monthlyRecurringRevenue ? `${adminDashboardStats.monthlyRecurringRevenue} ETB` : '0 ETB', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    const learningMetrics = [
        { label: 'Avg Completion', value: adminDashboardStats?.completionRate || '0%', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Avg Study Time', value: adminDashboardStats?.averageLearningTime ? `${Math.round(adminDashboardStats.averageLearningTime / 60)} min` : '0 min', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    const operationalMetrics = [
        { label: 'Instructor Activity', value: `${Math.round(adminDashboardStats?.instructorActivityRate || 0)}%`, icon: UserCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Pending Reviews', value: adminDashboardStats?.pendingReviews?.toString() || '0', icon: Loader2, color: 'text-rose-500', bg: 'bg-rose-50' },
        { label: 'Quiz Success', value: `${Math.round(adminDashboardStats?.quizCompletionRate || 0)}%`, icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Parent Engagement', value: `${Math.round(adminDashboardStats?.parentEngagementRate || 0)}%`, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    ];

    const topCoursesData = adminDashboardStats?.topCourses || [];

    const categoryData = adminDashboardStats?.categoryStats || [];

    if (loading && !adminDashboardStats) {
        return <Loading message="Fetching dashboard data..." />;
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
                    <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all cursor-default overflow-hidden relative">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest text-[10px]">{stat.label}</p>
                        </div>
                        <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                             <stat.icon className="w-16 h-16" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Growth & Operations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                         <BarChart3 className="w-5 h-5 text-primary" />
                         <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Growth Metrics</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {growthMetrics.map((stat, i) => (
                            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm hover:shadow-md transition-all">
                                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <h4 className="text-xl font-black text-slate-800">{stat.value}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                         <ShieldAlert className="w-5 h-5 text-rose-500" />
                         <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Operational Status</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {operationalMetrics.map((stat, i) => (
                            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm hover:shadow-md transition-all">
                                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <h4 className="text-xl font-black text-slate-800">{stat.value}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
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
<BarChart data={topCoursesData} layout="vertical" margin={{ left: 20, right: 40 }}>

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
                    <div className="h-[320px] flex items-center justify-center relative">
                        {categoryData.length === 0 ? (
                            <div className="text-slate-400 text-sm">No course categories yet</div>
                        ) : (
                            <>
                            <div className="absolute -left-8 top-1/2 -translate-y-1/2 hidden xl:block space-y-3 max-h-full overflow-y-auto px-3  ">
                                    {categoryData.filter(d => d.value > 0).map((d, i) => {
                                        const percentage = Math.round((d.value / courses.length) * 100);
                                        return (
                                            <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                                                <span className="truncate max-w-[100px]">{d.name}</span>
                                                <span className="text-slate-400 ml-auto">{percentage}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
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

                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-full">
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
                                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-slate-500 font-bold overflow-hidden border-2 border-slate-50">
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
                    </div>
                </div>

                {/* Top Students */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                         <Trophy className="w-6 h-6 text-amber-500" />
                         <h3 className="text-lg font-bold text-slate-800">Top Students</h3>
                    </div>
                    <div className="space-y-6">
                        {(adminDashboardStats?.topPerformingStudents?.length ? adminDashboardStats.topPerformingStudents : []).map((student, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-slate-300">#0{i + 1}</span>
                                    <span className="text-sm font-bold text-slate-700">{student.name}</span>
                                </div>
                                <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{student.score} pts</span>
                            </div>
                        ))}
                        {(!adminDashboardStats?.topPerformingStudents?.length) && (
                            <div className="text-center py-6 text-slate-400 text-sm">No top students yet</div>
                        )}
                    </div>
                </div>

                {/* Difficult Courses */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                         <ShieldAlert className="w-6 h-6 text-rose-500" />
                         <h3 className="text-lg font-bold text-slate-800">Most Difficult</h3>
                    </div>
                    <div className="space-y-6">
                        {(adminDashboardStats?.mostDifficultCourses || adminDashboardStats?.mostDifficultCoursesData || []).map((course, i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-700 truncate max-w-[120px]">{course.title}</span>
                                    <span className="font-black text-rose-500">{course.rate}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                     <div className="h-full bg-rose-400" style={{ width: `${course.rate}%` }} />
                                </div>
                            </div>
                        ))}
                        {(!adminDashboardStats?.mostDifficultCourses?.length && !adminDashboardStats?.mostDifficultCoursesData?.length) && (
                            <div className="text-center py-6 text-slate-400 text-sm">No difficult courses yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
