import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, ChevronRight, ArrowLeft, Trophy, Calendar } from 'lucide-react';
import api from '../../lib/api';
import Loading from '../../components/Loading';

export default function ParentChildren() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.get('/parents/linked-students');
                setStudents(response.data);
            } catch (error) {
                console.error("Failed to fetch students:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    if (loading) return <Loading />;

    // Detail View
    if (selectedStudent) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header / Back Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedStudent(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">{selectedStudent.fullName}</h1>
                        <p className="text-gray-500 font-medium">Detailed Progress Report</p>
                    </div>
                </div>

                {/* Student Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#00B4D8]">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Courses</p>
                            <p className="text-xl font-black text-gray-900">{selectedStudent.enrolledCount || 0} Enrolled</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Avg. Progress</p>
                            <p className="text-xl font-black text-gray-900">{Math.round(selectedStudent.averageProgress || 0)}% Completed</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">School</p>
                            <p className="text-xl font-black text-gray-900">{selectedStudent.schoolName || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Course List */}
                <h2 className="text-xl font-bold text-gray-900">Enrolled Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedStudent.enrolledCourses && selectedStudent.enrolledCourses.length > 0 ? (
                        selectedStudent.enrolledCourses.map((course, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={course.id || idx}
                                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                                            <img
                                                src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://abritech.onrender.com'}${course.thumbnail}`) : "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=600"}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-[#00B4D8] transition-colors line-clamp-1">{course.name}</h3>
                                            <p className="text-sm text-gray-500">In Progress</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-[#00B4D8]">{course.progress || 0}%</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#00B4D8] rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${course.progress || 0}%` }}
                                    ></div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No courses enrolled yet.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">My <span className="text-[#00B4D8]">Children</span></h1>
                <p className="text-gray-500 mt-2 text-lg">Select a child to view their detailed progress and course activity.</p>
            </header>

            {students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student, i) => (
                        <motion.button
                            key={student.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setSelectedStudent(student)}
                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all text-left group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-500">
                                <Users className="w-32 h-32" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-[#00B4D8] mb-6 shadow-inner ring-4 ring-white">
                                    <span className="text-2xl font-black">{student.fullName.charAt(0)}</span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#00B4D8] transition-colors">{student.fullName}</h3>
                                <div className="space-y-1 mb-6">
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        {student.schoolName || 'School Not Set'}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        {student.classLevel || 'Grade Not Set'}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Courses</p>
                                        <p className="text-lg font-black text-gray-900">{student.enrolledCount || 0}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#00B4D8] group-hover:text-white transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Children Linked</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                        Link your children's accounts to start tracking their progress and supporting their learning journey.
                    </p>
                </div>
            )}
        </div>
    );
}
