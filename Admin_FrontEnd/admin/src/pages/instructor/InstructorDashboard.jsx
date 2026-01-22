import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, TrendingUp, CheckCircle2, ArrowRight, Info, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const [showBanner, setShowBanner] = useState(false);
    const [statsData, setStatsData] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            // Show banner only if firstLogin is true (1)
            setShowBanner(!!parsedUser.firstLogin);
        }

        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            try {
                const [statsRes, coursesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/teachers/dashboard`, { headers }),
                    fetch(`${API_BASE_URL}/teachers/courses`, { headers })
                ]);

                if (statsRes.ok && coursesRes.ok) {
                    const stats = await statsRes.json();
                    const coursesData = await coursesRes.json();
                    setStatsData(stats);
                    setCourses(coursesData);
                }
            } catch (error) {
                console.error("Failed to fetch instructor data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const stats = [
        { label: 'Assigned Courses', value: statsData?.assignedCourses || '0', icon: BookOpen, bg: 'bg-blue-50', color: 'text-blue-500' },
        { label: 'Total Students', value: statsData?.totalStudents || '0', icon: Users, bg: 'bg-green-50', color: 'text-green-500' },
        { label: 'Active Assignments', value: statsData?.activeAssignments || '0', icon: Clock, bg: 'bg-amber-50', color: 'text-amber-500' },
        { label: 'Avg Completion', value: statsData?.averageCompletion ? `${statsData.averageCompletion}%` : 'N/A', icon: TrendingUp, bg: 'bg-purple-50', color: 'text-purple-500' },
    ];

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.fullName || 'Teacher'}</h1>
                <p className="text-slate-500 text-sm mt-1">Here's an overview of your courses and students</p>
            </div>

            {/* Credential Update Recommendation Banner */}
            {showBanner && (
                <div className="bg-gradient-to-r from-blue-50 to-primary/5 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-1">Secure Your Account</h3>
                        <p className="text-sm text-slate-600 mb-3">
                            We recommend updating your auto-generated credentials to something more memorable and secure.
                        </p>
                        <button
                            onClick={() => navigate('/change-credentials')}
                            className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center gap-2"
                        >
                            Update Credentials
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowBanner(false)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                </div>
            )}

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
                {/* Assignments Overview */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Assignments Overview</h3>
                                <p className="text-xs text-slate-400 font-bold">Active assignments across your courses</p>
                            </div>
                        </div>
                        <button className="text-sm font-bold text-primary hover:underline">View All</button>
                    </div>

                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <p className="text-lg font-bold text-slate-800">
                            {statsData?.activeAssignments > 0 ? `${statsData.activeAssignments} active assignments` : 'No pending reviews'}
                        </p>
                    </div>
                </div>

                {/* My Courses */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">My Courses</h3>
                            <p className="text-xs text-slate-400 font-bold">Courses you're teaching</p>
                        </div>
                        <button className="text-sm font-bold text-primary hover:underline" onClick={() => navigate('/instructor/courses')}>View All</button>
                    </div>

                    <div className="space-y-6">
                        {courses.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 font-medium italic">
                                No courses assigned to you yet.
                            </div>
                        ) : (
                            courses.map((course, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-start text-left">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{course.name}</h4>
                                            <p className="text-xs font-bold text-slate-400 mt-0.5">{course.enrolledStudents} students enrolled</p>
                                        </div>
                                        <span className="text-xs font-black text-slate-800">{course.level}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: '100%' }}
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

export default InstructorDashboard;
