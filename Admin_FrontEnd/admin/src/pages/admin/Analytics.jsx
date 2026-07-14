import React, { useState } from 'react';
import {
    Users,
    Activity,
    BookOpen,
    DollarSign,
    CheckSquare,
    ChevronRight,
    Search,
    Filter,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    GraduationCap,
    School,
    Clock,
    Target,
    Heart,
    Zap,
    Trophy,
    PieChart as PieChartIcon
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { useAdminAnalytics } from '../../hooks/useAdminQueries';
import Loading from '../../components/Loading';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#f43f5e', '#6366f1'];

const SectionCard = ({ title, description, children, icon: Icon }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800">{title}</h3>
                    <p className="text-sm font-bold text-slate-400">{description}</p>
                </div>
            </div>
        </div>
        <div className="h-[300px] w-full">
            {children}
        </div>
    </div>
);

const Analytics = () => {
    const { data: analytics, isLoading } = useAdminAnalytics();
    const [activeTab, setActiveTab] = useState('demographics');

    if (isLoading) {
        return <Loading message="Fetching analytics data..." />;
    }

    const tabs = [
        { id: 'demographics', label: 'Demographics', icon: Users },
        { id: 'engagement', label: 'Engagement', icon: Activity },
        { id: 'courses', label: 'Course Analysis', icon: BookOpen },
        { id: 'revenue', label: 'Revenue', icon: DollarSign },
        { id: 'projects', label: 'Projects', icon: CheckSquare },
    ];

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Data Intelligence</h1>
                    <p className="text-slate-500 font-bold text-sm mt-1">Deep-dive into platform performance and student growth</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Conversion Rate', value: `${analytics?.revenue?.conversionRate || 0}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Avg Satisfaction', value: '4.8/5', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Active Projects', value: analytics?.projects?.status?.find(s => s.label === 'approved')?.value || '0', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Lesson Engagement', value: 'High', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {activeTab === 'demographics' && (
                    <>
                        <SectionCard title="Gender Distribution" description="Student diversity overview" icon={Users}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics?.demographics?.gender}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {analytics?.demographics?.gender?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </SectionCard>
                        <SectionCard title="Enrollment Distribution" description="Paid vs Free students" icon={PieChartIcon}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics?.revenue?.enrollmentTypes}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {analytics?.revenue?.enrollmentTypes?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </SectionCard>
                        <SectionCard title="Grade Distribution" description="Students by class level" icon={GraduationCap}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.demographics?.grade}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </SectionCard>
                        <div className="lg:col-span-2">
                             <SectionCard title="Top Schools" description="Distribution of students across educational institutions" icon={School}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics?.demographics?.school} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="label" type="category" width={150} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SectionCard>
                        </div>
                    </>
                )}

                {activeTab === 'engagement' && (
                    <>
                        <div className="lg:col-span-2">
                            <SectionCard title="Weekly Active Students" description="Daily user login patterns" icon={Activity}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics?.engagement?.weeklyActive}>
                                        <defs>
                                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' })} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </SectionCard>
                        </div>
                        <SectionCard title="Course Completion Rates" description="Average progress per course" icon={Target}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.engagement?.completionRates}>
                                    <XAxis dataKey="label" hide />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </SectionCard>
                        <SectionCard title="Avg Time Spent (Min)" description="Daily learning duration per course" icon={Clock}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.engagement?.timeSpent}>
                                    <XAxis dataKey="label" hide />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </SectionCard>
                    </>
                )}

                {activeTab === 'courses' && (
                    <>
                        <SectionCard title="Course Popularity" description="Total enrollments by course" icon={Zap}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.courses?.popularity} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="label" type="category" width={150} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </SectionCard>
                        <SectionCard title="Drop-off Rates (%)" description="Students with 0% progress" icon={ArrowDownRight}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.courses?.dropOffRates}>
                                    <XAxis dataKey="label" hide />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </SectionCard>
                    </>
                )}

{activeTab === 'revenue' && (
                    <>
                        <SectionCard title="Paid vs Free" description="Enrollment type distribution" icon={PieChartIcon}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics?.revenue?.enrollmentTypes}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {analytics?.revenue?.enrollmentTypes?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </SectionCard>
                        <SectionCard title="Revenue by Course" description="Top earning courses" icon={DollarSign}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.revenue?.revenueByCourse}>
                                    <XAxis dataKey="label" hide />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </SectionCard>
                        <div className="lg:col-span-2">
                            <SectionCard title="Monthly Revenue Trend" description="Income over time" icon={ArrowUpRight}>

                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics?.revenue?.monthlyTrend}>
                                         <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short' })} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </SectionCard>
                        </div>
                    </>
                )}

                {activeTab === 'projects' && (
                    <>
                        <SectionCard title="Project Status" description="Distribution of submissions" icon={CheckSquare}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics?.projects?.status}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {analytics?.projects?.status?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </SectionCard>
                        <SectionCard title="Student Innovation Index" description="Top project scorers" icon={Trophy}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.projects?.innovationIndex} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="label" type="category" width={150} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </SectionCard>
                        <div className="lg:col-span-2">
                             <SectionCard title="Quiz Participation by Course" description="Student activity across lesson assessments" icon={Target}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics?.projects?.quizParticipation}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SectionCard>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Analytics;
