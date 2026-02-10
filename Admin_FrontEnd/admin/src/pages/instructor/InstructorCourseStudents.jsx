import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users,
    Search,
    ArrowLeft,
    Plus,
    MoreVertical,
    Mail,
    BookOpen,
    TrendingUp,
    ChevronRight
} from 'lucide-react';
import { useInstructor } from '../../context/InstructorContext';
import AddProjectModal from '../../components/modals/AddProjectModal';
import Loading from '../../components/Loading';

const InstructorCourseStudents = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { fetchCourseStudents, assignedCourses } = useInstructor();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const course = assignedCourses.find(c => c.id === parseInt(courseId));

    useEffect(() => {
        const loadStudents = async () => {
            setLoading(true);
            const data = await fetchCourseStudents(courseId);
            setStudents(data);
            setLoading(false);
        };
        loadStudents();
    }, [courseId, fetchCourseStudents]);

    const filteredStudents = students.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <Loading fullScreen={false} message="Loading student list..." />;
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Breadcrumb & Header */}
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/instructor/courses')}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Courses
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{course?.name || 'Course Students'}</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage student progress and assign course-wide projects</p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add Course Project
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">{students.length}</h3>
                        <p className="text-sm font-bold text-slate-400">Total Enrolled</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {students.length > 0
                                ? Math.round(students.reduce((acc, s) => acc + (s.avgProgress || 0), 0) / students.length)
                                : 0}%
                        </h3>
                        <p className="text-sm font-bold text-slate-400">Avg. Course Progress</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">{course?.activeAssignments || 0}</h3>
                        <p className="text-sm font-bold text-slate-400">Active Projects</p>
                    </div>
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Student Info</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Progress</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-12 text-center text-slate-400 font-medium bg-white">
                                        No students found in this course.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                                        onClick={() => navigate(`/instructor/courses/${courseId}/students/${student.id}`)}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-black text-lg group-hover:bg-primary group-hover:text-white transition-all">
                                                    {student.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-base">{student.fullName}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                            <Mail className="w-3.5 h-3.5" />
                                                            {student.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="max-w-[180px]">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-black text-slate-800">{Math.round(student.avgProgress || 0)}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-500"
                                                        style={{ width: `${student.avgProgress || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group/btn">
                                                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Project Modal */}
            {isAddModalOpen && (
                <AddProjectModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    courseId={courseId}
                />
            )}
        </div>
    );
};

export default InstructorCourseStudents;
