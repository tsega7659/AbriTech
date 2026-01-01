import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings as SettingsIcon,
    Shield,
    User,
    Bell,
    Lock,
    ChevronRight,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const settingsSections = [
        {
            title: 'Account Security',
            icon: Shield,
            items: [
                {
                    label: 'Change Username & Password',
                    desc: 'Update your login credentials for better security',
                    icon: Lock,
                    action: () => navigate('/change-credentials')
                }
            ]
        },
        {
            title: 'Personal Information',
            icon: User,
            items: [
                { label: 'Full Name', value: user?.fullName || 'N/A', icon: User },
                { label: 'Email Address', value: user?.email || 'N/A', icon: Mail },
            ]
        }
    ];

    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 font-sans">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <SettingsIcon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Settings</h1>
                    <p className="text-slate-500 font-bold">Manage your account preferences and security settings.</p>
                </div>
            </div>

            <div className="space-y-6">
                {settingsSections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
                            <section.icon className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{section.title}</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {section.items.map((item, iidx) => (
                                <div
                                    key={iidx}
                                    onClick={item.action}
                                    className={`p-8 flex items-center justify-between transition-all ${item.action ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 tracking-tight">{item.label}</p>
                                            {item.desc && <p className="text-xs font-bold text-slate-400">{item.desc}</p>}
                                            {item.value && <p className="text-sm font-bold text-primary">{item.value}</p>}
                                        </div>
                                    </div>
                                    {item.action && (
                                        <ChevronRight className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-6">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                    <Lock className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="font-black text-slate-800 tracking-tight text-lg">Always keep your account secure</h4>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">
                        We recommend changing your password every 90 days. If you notice any suspicious activity, please contact the administrator immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
