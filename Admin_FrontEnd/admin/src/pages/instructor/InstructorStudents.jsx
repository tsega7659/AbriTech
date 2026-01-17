import React, { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import { API_BASE_URL } from '../../config/apiConfig';
import Loading from '../../components/Loading';

const InstructorStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/teachers/students`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setStudents(data);
                } else {
                    console.error("Failed to fetch students:", data.message);
                }
            } catch (error) {
                console.error("Failed to fetch students:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <Loading fullScreen={false} message="Loading your students..." />;
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Students</h1>
                <p className="text-slate-500 text-sm mt-1">Students enrolled in your courses</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search students by name or email..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-slate-400" />
                        <h3 className="text-lg font-bold text-slate-800">All Students ({students.length})</h3>
                    </div>
                    <p className="text-xs font-bold text-slate-400">Students enrolled in your courses</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Enrolled Courses</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Average Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-12 text-center text-slate-500 font-bold">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => {
                                    const enrolledCourses = Array.isArray(student.enrolledCourses)
                                        ? student.enrolledCourses
                                        : (typeof student.enrolledCourses === 'string' ? JSON.parse(student.enrolledCourses) : []);

                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        <img
                                                            src={`https://ui-avatars.com/api/?name=${student.fullName.replace(' ', '+')}&background=4dbfec&color=fff`}
                                                            alt={student.fullName}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{student.fullName}</p>
                                                        <p className="text-xs font-bold text-slate-400">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {enrolledCourses.map((course, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold ring-1 ring-blue-100"
                                                        >
                                                            {course}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3 max-w-xs">
                                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-500"
                                                            style={{ width: `${student.avgProgress || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-800 w-10">{Math.round(student.avgProgress || 0)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstructorStudents;

