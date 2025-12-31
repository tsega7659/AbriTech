import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

const InstructorProjects = () => {
    const [activeTab, setActiveTab] = useState('pending');

    const stats = [
        { label: 'Pending Review', value: '0', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Approved', value: '1', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Needs Revision', value: '0', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    ];

    const tabs = [
        { id: 'pending', label: 'Pending', count: 0 },
        { id: 'approved', label: 'Approved', count: 1 },
        { id: 'revision', label: 'Revision', count: 0 },
    ];

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Project Reviews</h1>
                <p className="text-slate-500 text-sm mt-1">Review and approve student project submissions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</h3>
                        <p className="text-sm font-bold text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 font-bold text-sm transition-all relative ${activeTab === tab.id
                                ? 'text-primary'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            {tab.id === 'pending' && <Clock className="w-4 h-4" />}
                            {tab.id === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                            {tab.id === 'revision' && <XCircle className="w-4 h-4" />}
                            {tab.label} ({tab.count})
                        </div>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12">
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">All caught up!</h3>
                    <p className="text-slate-500 font-medium">No projects waiting for review</p>
                </div>
            </div>
        </div>
    );
};

export default InstructorProjects;
