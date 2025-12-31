import React, { useState } from 'react';
import {
    CheckSquare,
    Clock,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Search,
    Filter,
    Eye,
    MessageCircle
} from 'lucide-react';

const ProjectReview = () => {
    const projects = [
        { id: 1, student: 'Alice Johnson', projectTitle: 'E-commerce UI Mockup', course: 'UI/UX Design', submittedAt: '2023-12-29 14:30', status: 'Pending' },
        { id: 2, student: 'Bob Smith', projectTitle: 'Personal Portfolio', course: 'React Basics', submittedAt: '2023-12-28 09:15', status: 'Reviewed' },
        { id: 3, student: 'Michael Chen', projectTitle: 'Task Manager API', course: 'Node.js API', submittedAt: '2023-12-30 11:45', status: 'Pending' },
        { id: 4, student: 'Sophia Wilson', projectTitle: 'Travel Vlog Logo', course: 'Graphic Design', submittedAt: '2023-12-25 16:20', status: 'Rejected' },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2 text-slate-900">Project Review & Approval</h1>
                <p className="text-slate-500">Review student submissions, provide feedback, and manage project approvals.</p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {[
                    { label: 'Total Pending', count: '12', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Reviewed Today', count: '8', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/5' },
                    { label: 'Average Review Time', count: '1.4h', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((stat, i) => (
                    <div key={i} className="flex-shrink-0 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-premium flex items-center gap-4 min-w-[240px]">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-xl font-bold text-slate-900">{stat.count}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search projects or students..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all text-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                        <Filter className="w-4 h-4" /> All Status
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student & Project</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Course</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Submitted</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {projects.map((proj) => (
                                <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div>
                                            <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{proj.projectTitle}</p>
                                            <p className="text-sm text-slate-500 font-medium">{proj.student}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-semibold text-slate-600">{proj.course}</td>
                                    <td className="px-6 py-5 text-sm text-slate-500 font-medium">{proj.submittedAt}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${proj.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                proj.status === 'Reviewed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {proj.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all" title="View Submission">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all" title="Review">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all" title="Comment">
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                        </div>
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

export default ProjectReview;
