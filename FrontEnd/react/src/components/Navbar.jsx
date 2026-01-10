import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";


const navigation = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const isActive = (path) => {
        if (path === "/" && location.pathname !== "/") return false;
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    const getDashboardPath = () => {
        if (user?.role === 'student') return '/dashboard/student';
        if (user?.role === 'parent') return '/dashboard/parent';
        return '/';
    };

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src={logo} alt="AbriTech Solutions" className="h-10 w-auto" />
                        </Link>
                        <span className="text-xl font-bold text-gray-800">AbriTech Solutions</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors relative",
                                    isActive(item.href)
                                        ? "text-[#00B4D8] font-bold"
                                        : "text-gray-700 hover:text-[#00B4D8]"
                                )}
                            >
                                {item.name}
                                {isActive(item.href) && (
                                    <span className="absolute -bottom-6 left-0 w-full h-1 bg-[#00B4D8] rounded-t-full"></span>
                                )}
                            </Link>
                        ))}
                        <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                            {user ? (
                                <>
                                    <Link
                                        to={getDashboardPath()}
                                        className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#00B4D8] transition-colors"
                                    >
                                        <User className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/auth/login"
                                        className="text-sm font-bold text-gray-500 hover:text-[#00B4D8] transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/auth/get-started"
                                        className="bg-[#00B4D8] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#0096B4] transition-all shadow-lg hover:shadow-[#00B4D8]/30 hover:-translate-y-0.5"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-primary p-2 transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={cn("md:hidden absolute w-full bg-white border-b border-gray-100 transition-all duration-300 ease-in-out", isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden")}>
                <div className="px-4 pt-2 pb-6 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "block px-3 py-2 rounded-md text-base font-medium",
                                isActive(item.href)
                                    ? "text-[#00B4D8] bg-[#00B4D8]/10"
                                    : "text-gray-700 hover:text-[#00B4D8] hover:bg-gray-50"
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 flex flex-col gap-3">
                        {user ? (
                            <>
                                <Link
                                    to={getDashboardPath()}
                                    className="flex items-center justify-center gap-2 w-full text-center text-gray-700 font-bold py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-[#00B4D8] transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User className="h-5 w-5" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-base font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-gray-100"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/auth/login"
                                    className="block w-full text-center text-gray-600 font-bold py-2 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-[#00B4D8] transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/auth/get-started"
                                    className="block w-full text-center bg-[#00B4D8] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#0096B4] transition-all shadow-lg"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
