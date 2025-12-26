import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterParent() {
    const [showPassword, setShowPassword] = useState(false);
    const [referralCode, setReferralCode] = useState("");
    const [isLinked, setIsLinked] = useState(false);

    const handleVerifyCode = () => {
        // Mock verification
        if (referralCode.length > 3) setIsLinked(true);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Parent Registration</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Create an account to monitor your child's progress
                </p>
            </div>

            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        Link Your Child
                        {isLinked && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </h3>
                    <p className="text-sm text-blue-700 mb-4">
                        Enter the referral code sent to your email/phone when your child registered.
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter Referral Code"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value)}
                            className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none bg-white"
                        />
                        <button
                            onClick={handleVerifyCode}
                            disabled={isLinked}
                            className={`px-4 py-2 rounded-lg font-bold transition-colors ${isLinked ? 'bg-green-500 text-white' : 'bg-[#00B4D8] text-white hover:bg-[#0096B4]'}`}
                        >
                            {isLinked ? 'Linked!' : 'Verify'}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDB813]/20 focus:border-[#FDB813] outline-none transition-all" placeholder="Enter your full name" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input type="email" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDB813]/20 focus:border-[#FDB813] outline-none transition-all" placeholder="Enter your email" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input type="tel" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDB813]/20 focus:border-[#FDB813] outline-none transition-all" placeholder="Enter your phone" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDB813]/20 focus:border-[#FDB813] outline-none transition-all"
                            placeholder="Create a password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button className="w-full bg-[#FDB813] text-white font-bold py-3.5 rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-200">
                        Create Parent Account
                    </button>
                </div>
            </div>

            <div className="text-center mt-6">
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
