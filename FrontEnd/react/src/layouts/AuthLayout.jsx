import { Outlet, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
                <div className="w-[800px] h-[800px] bg-[#00B4D8] rounded-full opacity-5 blur-3xl"></div>
            </div>
            <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4">
                <div className="w-[600px] h-[600px] bg-[#FDB813] rounded-full opacity-5 blur-3xl"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
                <Link to="/" className="flex justify-center items-center gap-2 text-gray-500 hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </Link>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100/50 sm:rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden">

                    <Outlet />
                </div>
            </div>
        </div>
    );
}
