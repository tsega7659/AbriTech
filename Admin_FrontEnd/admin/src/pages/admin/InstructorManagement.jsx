import React, { useState } from 'react';
import {
    UserPlus,
    Search,
    BookOpen,
    Mail,
    Lock,
    ShieldCheck,
    MoreHorizontal,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Link2
} from 'lucide-react';

const courses = [
    'Introduction to Python Programming',
    'Robotics Fundamentals',
    'AI and Machine Learning Basics',
    'University Readiness Program',
    'Digital Creativity with Canva',
    'Mobile App Development',
    'Web Development Bootcamp'
];

const initialInstructors = [
    { id: 1, name: 'Dr. Tadesse Bekele', email: 'tadesse@abritech.com', assignedCourses: ['Introduction to Python Programming'], status: 'Active' },
    { id: 2, name: 'Eng. Meron Assefa', email: 'meron@abritech.com', assignedCourses: ['Robotics Fundamentals'], status: 'Active' },
    { id: 3, name: 'Dr. Yonas Tesfaye', email: 'yonas@abritech.com', assignedCourses: ['AI and Machine Learning Basics'], status: 'Active' },
];

const InstructorManagement = () => {
    const [instructors, setInstructors] = useState(initialInstructors);
    const [isRegistering, setIsRegistering] = useState(false);
    const [newInstructor, setNewInstructor] = useState({ name: '', email: '', password: '', assignedCourse: '' });

    const handleRegister = (e) => {
        e.preventDefault();
        const instructor = {
            id: instructors.length + 1,
            name: newInstructor.name,
            email: newInstructor.email,
            assignedCourses: newInstructor.assignedCourse ? [newInstructor.assignedCourse] : [],
            status: 'Active'
        };
        setInstructors([...instructors, instructor]);
        setIsRegistering(false);
        setNewInstructor({ name: '', email: '', password: '', assignedCourse: '' });
    };

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Instructors</h1>
                    <p className="text-slate-500 text-sm font-semibold">Register and manage instructors and their course assignments</p>
                </div>
                {!isRegistering && (
                    <button
                        onClick={() => setIsRegistering(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
                    >
                        <UserPlus className="w-5 h-5" /> Register Instructor
                    </button>
                )}
            </div>

            {isRegistering && (
                <div className="bg-white p-8 rounded-[2rem] border border-primary/20 shadow-xl shadow-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" /> Register New Instructor
                        </h3>
                        <button onClick={() => setIsRegistering(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Dr. John Doe"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newInstructor.name}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="instructor@abritech.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newInstructor.email}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                    value={newInstructor.password}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assign Initial Course</label>
                            <div className="relative">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700 appearance-none"
                                    value={newInstructor.assignedCourse}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, assignedCourse: e.target.value })}
                                >
                                    <option value="">Select a course (Optional)</option>
                                    {courses.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(false)}
                                className="px-8 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-10 py-3.5 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
                            >
                                Complete Registration
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search instructors by name or email..."
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                    />
                </div>
            </div>

            {/* Instructors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {instructors.map((inst) => (
                    <div key={inst.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-primary/30 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden ring-4 ring-slate-50">
                                    <img src={`https://ui-avatars.com/api/?name=${inst.name}&background=4dbfec&color=fff`} alt="" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{inst.name}</h4>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tight">
                                        <Mail className="w-3 h-3" /> {inst.email}
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Link2 className="w-3 h-3" /> Assigned Courses
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {inst.assignedCourses.length > 0 ? inst.assignedCourses.map((c, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold ring-1 ring-blue-100">
                                            {c}
                                        </span>
                                    )) : (
                                        <span className="text-xs font-bold text-slate-300 italic">No courses assigned</span>
                                    )}
                                    <button className="px-3 py-1 border border-dashed border-slate-300 text-slate-400 rounded-lg text-xs font-bold hover:border-primary hover:text-primary transition-all">
                                        + Assign
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle2 className="w-3 h-3" /> {inst.status}
                                </span>
                                <button className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline">
                                    Manage Profile
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InstructorManagement;
