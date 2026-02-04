import { Link } from "react-router-dom";
import { Lightbulb, Instagram, Linkedin, Send } from "lucide-react";
import { FaTiktok } from "react-icons/fa";


export default function Footer() {
    return (
        <footer className="bg-[#0b1120] text-gray-200 pt-20 pb-10 border-t border-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="bg-[#00B4D8]/10 p-2 rounded-xl">
                                <Lightbulb className="h-6 w-6 text-[#00B4D8]" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-white">AbriTech</span>
                        </Link>
                        <p className="text-white mb-8 leading-relaxed">
                            "Connecting Education to Innovation"
                        </p>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Making high-quality STEM education accessible, affordable and relevant for Ethiopian youth.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/abritech_solutions?igsh=MW9mcnYwYjgwcDBqNw%3D%3D&utm_source=qr" className="bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#00B4D8] transition-all">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="https://t.me/abritechsolutions" className="bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#00B4D8] transition-all">
                                <Send className="h-5 w-5" />
                            </a>
                            <a href="https://www.linkedin.com/company/abritech/" className="bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#00B4D8] transition-all">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="https://www.tiktok.com/@abritech_solutions?is_from_webapp=1&sender_device=pc" className="bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#00B4D8] transition-all">
                                <FaTiktok className="h-5 w-5" />
                            </a>
                            
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            {['Home',  'Courses', 'Blog', 'About', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-gray-400 hover:text-[#00B4D8] transition-colors flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] opacity-0 group-hover:opacity-100"></div>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Contact</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start gap-3">
                                <span className="text-white font-medium">Phone:</span>
                                +251-961-701470
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-white font-medium">Email:</span>
                                info@abritechet.com
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-white font-medium">Address:</span>
                                Addis Ababa, Ethiopia
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Blogs</h3>
                        <p className="text-gray-400 mb-6 text-sm">Subscribe to get the latest updates and news.</p>
                        <form className="flex gap-2">
                            
                            <Link to= "/blog" className="bg-[#00B4D8] text-white p-3 rounded-lg hover:bg-[#0096B4] transition-colors shadow-lg shadow-[#00B4D8]/20">
                               Read Blog
                            </Link>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} AbriTech Solutions. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
