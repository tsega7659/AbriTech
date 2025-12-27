import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    TrendingUp,
    Briefcase,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    User,
    Users
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ role = "student" }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

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
        { name: "Events", href: "/dashboard/parent/events", icon: Briefcase }, // Briefcase as placeholder
    ];

    const { user, logout } = useAuth();
    const links = role === "parent" ? parentLinks : studentLinks;

    const handleLogout = () => {
        logout();
        navigate("/auth/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="AbriTech" className="h-8 w-auto" />
                            <span className="font-bold text-gray-900">AbriTech LMS</span>
                        </Link>
                    </div>

                    {/* Nav Links */}
                    <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-[#00B4D8] text-white"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom Section */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 px-2 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#00B4D8] font-bold">
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName || 'User'}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role || role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        >
                            <LogOut className="h-5 w-5" /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar (Mobile Only mostly) */}
                <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-bold text-gray-900">AbriTech LMS</span>
                    <div className="w-6"></div> {/* Spacer */}
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
