import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    CheckSquare,
    TrendingUp,
    LogOut,
    Menu,
    X,
    Bell,
    Settings,
    Sparkles,
    UserCheck,
    UserPlus,
    FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logo from '../../assets/logo.png';
import LogoutModal from '../LogoutModal';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const SidebarLink = ({ to, icon: Icon, label, active }) => (
    <Link
        to={to}
        className={cn(
            "flex items-center gap-3 px-6 py-3 transition-all duration-200 group sidebar-pill",
            active
                ? "bg-primary/10 text-primary active shadow-sm"
                : "text-text-muted hover:bg-slate-50 hover:text-primary"
        )}
    >
        <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-text-muted group-hover:text-primary")} />
        <span className="font-semibold text-sm">{label}</span>
    </Link>
);

const DashboardLayout = ({ role }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Auto-close sidebar on mobile when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const handleLogoutConfirm = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        setIsLogoutModalOpen(false);
    };

    const adminLinks = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
        { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
        { to: '/admin/blogs', icon: FileText, label: 'Blogs' },
        { to: '/admin/students', icon: Users, label: 'Students' },
        { to: '/admin/instructors', icon: UserCheck, label: 'Instructors' },
        { to: '/admin/parents', icon: Users, label: 'Parents' },
        { to: '/admin/users/register', icon: UserPlus, label: 'Register User' },
        { to: '/admin/projects', icon: CheckSquare, label: 'Projects' },
        { to: '/admin/ai-insights', icon: Sparkles, label: 'AI Insights' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

    const instructorLinks = [
        { to: '/instructor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
        { to: '/instructor/projects', icon: CheckSquare, label: 'Project Reviews' },
        { to: '/instructor/students', icon: Users, label: 'Students' },
        { to: '/instructor/analytics', icon: TrendingUp, label: 'Performance' },
        { to: '/instructor/settings', icon: Settings, label: 'Settings' },
    ];

    const links = role === 'admin' ? adminLinks : instructorLinks;

    return (
        <div className="flex h-screen overflow-hidden bg-background text-text-main font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-72 bg-white border-r border-border z-50 transition-transform duration-300 lg:translate-x-0 overflow-y-auto",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="p-8 pb-10 sticky top-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <img src={logo} alt="Logo" className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-800">AbriTech</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role} Panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        {links.map((link) => (
                            <SidebarLink
                                key={link.to}
                                {...link}
                                active={location.pathname === link.to}
                            />
                        ))}
                    </nav>

                    {/* User Profile Footer in Sidebar */}
                    <div className="p-4 mt-auto border-t border-border bg-slate-50/50 sticky bottom-0 z-10 bg-white">
                        <div className="flex items-center gap-3 px-2 py-3 mb-2">
                            <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=4dbfec&color=fff`}
                                    alt="User"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName || 'Loading...'}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-72 h-full">
                {/* Desktop Header */}
                <header className="hidden lg:flex h-16 bg-white border-b border-border items-center justify-end px-6 sticky top-0 z-30 gap-3">
                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white text-slate-600 font-bold text-sm transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 hover:shadow-md active:scale-95 group"
                    >
                        <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                        Log Out
                    </button>
                </header>

                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
                    <button
                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-bold text-slate-800 capitalize">
                        {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50/30">
                    <Outlet />
                </div>
            </main>

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
            />
        </div>
    );
};

export default DashboardLayout;
