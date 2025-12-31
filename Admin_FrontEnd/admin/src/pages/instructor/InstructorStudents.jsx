import React from 'react';
import { Search, Users } from 'lucide-react';

const students = [
    {
        id: 1,
        name: 'Abebe Kebede',
        email: 'student@abritech.io',
        avatar: 'https://ui-avatars.com/api/?name=Abebe+Kebede&background=4dbfec&color=fff',
        enrolledCourses: ['Introduction to Pyth...', 'Mobile App Developme...'],
        avgProgress: 83,
        avgScore: 88,
    },
    {
        id: 2,
        name: 'Dawit Mengistu',
        email: 'dawit@abritech.io',
        avatar: 'https://ui-avatars.com/api/?name=Dawit+Mengistu&background=4dbfec&color=fff',
        enrolledCourses: ['Introduction to Pyth...'],
        avgProgress: 33,
        avgScore: 80,
    },
];

const InstructorStudents = () => {
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
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Average Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <img src={student.avatar} alt={student.name} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{student.name}</p>
                                                <p className="text-xs font-bold text-slate-400">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {student.enrolledCourses.map((course, i) => (
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
                                                    style={{ width: `${student.avgProgress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 w-10">{student.avgProgress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="inline-block px-4 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-black ring-1 ring-green-100">
                                            {student.avgScore}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstructorStudents;
