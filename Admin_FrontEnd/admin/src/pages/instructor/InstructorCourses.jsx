import { useState, useEffect } from 'react';
import { Users, Eye, TrendingUp, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../config/apiConfig';
import { useNavigate } from 'react-router-dom';

const InstructorCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/teachers/courses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setCourses(data);
                } else {
                    console.error("Failed to fetch courses:", data.message);
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }
    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Courses</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your courses and track student progress</p>
            </div>

            {/* Course Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {courses.length === 0 ? (
                    <div className="lg:col-span-2 text-center py-12 text-slate-400 bg-white rounded-[2rem] border border-slate-100 border-dashed">
                        <p className="font-medium text-lg">No courses assigned to you yet.</p>
                    </div>
                ) : (
                    courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:border-primary/30 transition-all">
                            {/* Category Badge */}
                            <div className="p-8 pb-6">
                                <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-tight ring-1 ring-blue-100">
                                    {course.category || 'General'}
                                </span>
                            </div>

                            {/* Course Content */}
                            <div className="px-8 pb-8 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">{course.name}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{course.description}</p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <span className="text-xl font-bold text-slate-800">{course.enrolledStudents || 0}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400">Students</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <TrendingUp className="w-4 h-4 text-slate-400" />
                                            <span className="text-xl font-bold text-slate-800">{course.completion || 0}%</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400">Completion</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <span className="text-xl font-bold text-slate-800">{course.avgScore || 'N/A'}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400">Avg Score</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Progress</span>
                                        <span className="text-xs font-black text-slate-800">{course.completion || 0}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${course.completion > 0 ? 'bg-primary' : 'bg-slate-300'}`}
                                            style={{ width: `${course.completion || 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* View Details Button */}
                                <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-all group">
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    )))}
            </div>
        </div>
    );
};

export default InstructorCourses;
