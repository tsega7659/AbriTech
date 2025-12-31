import React, { useState } from 'react';
import {
    Users,
    Search,
    Filter,
    Download,
    Plus,
    MoreVertical,
    Trash2,
    Edit2,
    ShieldAlert,
    CheckCircle2,
    XCircle
} from 'lucide-react';

const StudentManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const students = [
        { id: 1, name: 'John Smith', email: 'john@example.com', enrollmentDate: '2023-10-15', courses: 3, progress: 75, status: 'Active' },
        { id: 2, name: 'Emma Davis', email: 'emma@example.com', enrollmentDate: '2023-11-02', courses: 1, progress: 20, status: 'Inactive' },
        { id: 3, name: 'Michael Chen', email: 'michael@example.com', enrollmentDate: '2023-09-20', courses: 5, progress: 92, status: 'Active' },
        { id: 4, name: 'Sophia Wilson', email: 'sophia@example.com', enrollmentDate: '2023-12-05', courses: 2, progress: 10, status: 'Active' },
        { id: 5, name: 'James Miller', email: 'james@example.com', enrollmentDate: '2023-08-12', courses: 4, progress: 45, status: 'Deactivated' },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Student Management</h1>
                    <p className="text-text-muted">Manage all enrolled students, track progress, and update account statuses.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-semibold hover:bg-background transition-colors">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">
                        <Plus className="w-4 h-4" /> Add Student
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-card p-4 rounded-2xl border border-border shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                    <select className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-slate-50 focus:outline-none transition-colors">
                        <option>Status: All</option>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>Deactivated</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl border border-border shadow-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-background border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Student Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Enrollment Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Courses</th>
                                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Progress</th>
                                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-text-muted text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                {student.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{student.name}</p>
                                                <p className="text-xs text-text-muted">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{student.enrollmentDate}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{student.courses} Courses</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 max-w-[120px]">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${student.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{student.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${student.status === 'Active' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                student.status === 'Inactive' ? 'bg-slate-50 text-slate-600 ring-slate-600/20' :
                                                    'bg-red-50 text-red-700 ring-red-600/20'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-green-600' :
                                                    student.status === 'Inactive' ? 'bg-slate-400' : 'bg-red-600'
                                                }`} />
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit Student">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Deactivate">
                                                <ShieldAlert className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination placeholder */}
                <div className="p-6 border-t border-border flex items-center justify-between bg-slate-50/30">
                    <p className="text-sm text-text-muted font-medium">Showing 1 to 5 of 124 students</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-white transition-all disabled:opacity-50" disabled>Previous</button>
                        <button className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-white transition-all">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentManagement;
