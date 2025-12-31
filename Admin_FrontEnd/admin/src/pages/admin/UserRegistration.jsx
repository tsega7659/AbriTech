import React, { useState } from 'react';
import {
    UserPlus,
    Mail,
    Lock,
    User,
    Shield,
    GraduationCap,
    Users2,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    BookOpen
} from 'lucide-react';

const UserRegistration = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'student',
        assignedCourses: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const roles = [
        { id: 'admin', label: 'Administrator', icon: Shield, desc: 'Full platform access' },
        { id: 'teacher', label: 'Instructor', icon: BookOpen, desc: 'Manage courses & students' },
        { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Access learning content' },
        { id: 'parent', label: 'Parent', icon: Users2, desc: 'Monitor student progress' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 1500);
    };

    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 font-sans">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800">Register New User</h1>
                <p className="text-slate-500 font-bold">Create accounts for platform members and assign appropriate roles.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
                    {/* Role Selection Sidebar */}
                    <div className="lg:col-span-2 bg-slate-50/50 p-8 border-r border-slate-100 space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select User Role</h3>
                        <div className="space-y-3">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => setFormData({ ...formData, role: role.id })}
                                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex gap-4 ${formData.role === role.id
                                            ? 'bg-white border-primary shadow-lg shadow-primary/10'
                                            : 'bg-transparent border-transparent hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.role === role.id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'
                                        }`}>
                                        <role.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className={`font-bold ${formData.role === role.id ? 'text-slate-800' : 'text-slate-500'}`}>{role.label}</p>
                                        <p className="text-xs font-bold text-slate-400">{role.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <div className="flex gap-3 text-primary">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-xs font-bold leading-relaxed">
                                    Roles determine what sections of the platform the user can access and manage.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div className="lg:col-span-3 p-10 space-y-8">
                        {success && (
                            <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-sm font-bold tracking-tight">User successfully registered!</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                        placeholder="e.g. Abebe Kebede"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                        placeholder="user@abritech.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating Account...' : 'Register User'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRegistration;
