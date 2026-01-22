import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    TrendingUp,
    Briefcase,
    MessageSquare,
    LogOut,
    Menu,
    X,
    Bell,
    Users
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import LogoutModal from "../components/LogoutModal";

export default function DashboardLayout({ role = "student" }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const studentLinks = [
        { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
        { name: "My Courses", href: "/dashboard/student/courses", icon: BookOpen },
        { name: "Progress", href: "/dashboard/student/progress", icon: TrendingUp },
        { name: "Portfolio", href: "/dashboard/student/portfolio", icon: Briefcase },
        { name: "Projects", href: "/dashboard/student/projects", icon: Briefcase },
        { name: "AI Tutor", href: "/dashboard/student/ai-tutor", icon: MessageSquare },
    ];

    const parentLinks = [
        { name: "Dashboard", href: "/dashboard/parent", icon: LayoutDashboard },
        { name: "My Children", href: "/dashboard/parent/children", icon: Users },
        { name: "Reports", href: "/dashboard/parent/reports", icon: TrendingUp },
        { name: "Events", href: "/dashboard/parent/events", icon: Briefcase },
    ];

    const { user, logout } = useAuth();

    const getLinks = () => {
        if (role === "parent") return parentLinks;
        return studentLinks;
    };

    const links = getLinks();

    const handleLogoutConfirm = () => {
        logout();
        navigate("/auth/login");
        setIsLogoutModalOpen(false);
    };

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex">
            {/* Sidebar accessibility overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#00B4D8] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-100">
                                A
                            </div>
                            <span className="font-bold text-gray-900 tracking-tight">AbriTech LMS</span>
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                                        isActive
                                            ? "bg-[#00B4D8] text-white shadow-lg shadow-blue-100"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-[#00B4D8]"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom Section */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#00B4D8] font-bold shadow-inner">
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName || 'User'}</p>
                                <p className="text-[10px] font-bold text-[#00B4D8] uppercase tracking-wider">{user?.role || role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden text-gray-900 h-full">
                {/* Topbar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-6 sticky top-0 z-30 lg:px-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2.5 text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors lg:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 hidden sm:block">
                                {links.find(l => l.href === location.pathname)?.name || "Dashboard"}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2.5 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl transition-colors relative">
                            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                            <Bell className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-100 bg-white text-gray-600 font-bold text-sm transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 hover:shadow-md active:scale-95 group"
                        >
                            <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                            <span className="hidden sm:inline">Log Out</span>
                        </button>
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold lg:hidden">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
            />
        </div>
    );
}
