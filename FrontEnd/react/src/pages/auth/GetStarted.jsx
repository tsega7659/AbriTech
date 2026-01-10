import { Link } from "react-router-dom";
import { User, Users, GraduationCap, School } from "lucide-react";
import { motion } from "framer-motion";

export default function GetStarted() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Join AbriTech Area</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Choose how you want to join our learning community
                </p>
            </div>

            <div className="space-y-4">
                
                <Link to="/auth/register/student" className="block group">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center p-4 border-2 border-gray-100 rounded-xl hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-[#00B4D8]/10 rounded-full flex items-center justify-center text-[#00B4D8] group-hover:bg-[#00B4D8] group-hover:text-white transition-colors">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#00B4D8] transition-colors">I am a Student</h3>
                            <p className="text-sm text-gray-500">Access courses, quizzes, and assignments</p>
                        </div>
                    </motion.div>
                </Link>

                <Link to="/auth/register/parent" className="block group">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center p-4 border-2 border-gray-100 rounded-xl hover:border-[#FDB813] hover:bg-[#FDB813]/5 transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-[#FDB813]/10 rounded-full flex items-center justify-center text-[#FDB813] group-hover:bg-[#FDB813] group-hover:text-white transition-colors">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#FDB813] transition-colors">I am a Parent</h3>
                            <p className="text-sm text-gray-500">Monitor progress and stay updated</p>
                        </div>
                    </motion.div>
                </Link>
            </div>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="font-bold text-[#00B4D8] hover:text-[#0096B4]">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
