import { useState } from "react";
import { Link } from "react-router-dom";
import { School, User, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterStudent() {
    const [step, setStep] = useState(1);
    const [studentType, setStudentType] = useState(null); // 'enrolled' or 'finished'

    // Form fields
    const [formData, setFormData] = useState({
        fullName: "",
        gender: "",
        grade: "",
        schoolName: "",
        email: "",
        phone: "",
        parentPhone: "",
        parentEmail: "",
        courseLevel: "Beginner",
        address: "",
        educationLevel: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Student Registration</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Step {step} of 3
                </p>
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                    <div
                        className="h-full bg-[#00B4D8] transition-all duration-300 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <h3 className="font-bold text-gray-900 text-lg mb-4">I am currently...</h3>

                        <button
                            onClick={() => { setStudentType('enrolled'); handleNext(); }}
                            className="w-full flex items-center p-4 border-2 border-gray-100 rounded-xl hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all text-left group"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#00B4D8] group-hover:scale-110 transition-transform">
                                <School className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-gray-900">Enrolled in School</h4>
                                <p className="text-sm text-gray-500">I am currently attending a verified school.</p>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-[#00B4D8]" />
                        </button>

                        <button
                            onClick={() => { setStudentType('finished'); handleNext(); }}
                            className="w-full flex items-center p-4 border-2 border-gray-100 rounded-xl hover:border-[#FDB813] hover:bg-[#FDB813]/5 transition-all text-left group"
                        >
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-[#FDB813] group-hover:scale-110 transition-transform">
                                <User className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-gray-900">Finished / Out of School</h4>
                                <p className="text-sm text-gray-500">I have completed school or am taking a break.</p>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-[#FDB813]" />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        {studentType === 'enrolled' ? (
                            <>
                                <h3 className="font-bold text-gray-900 text-lg">School Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input type="text" name="fullName" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                            <select name="gender" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none">
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Class</label>
                                            <input type="text" name="grade" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none" placeholder="e.g. 10th Grade" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                                        <input type="text" name="schoolName" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Phone (Optional)</label>
                                        <input type="tel" name="phone" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="font-bold text-gray-900 text-lg">Personal Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input type="text" name="fullName" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input type="tel" name="phone" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <input type="text" name="address" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                                        <select name="educationLevel" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none">
                                            <option value="">Select Level</option>
                                            <option value="high_school">High School</option>
                                            <option value="undergraduate">Undergraduate</option>
                                            <option value="graduate">Graduate</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="flex gap-4 mt-4">
                            <button onClick={handleBack} className="w-full py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors text-sm">Back</button>
                            <button onClick={handleNext} className="w-full bg-[#00B4D8] text-white font-bold py-2.5 rounded-xl hover:bg-[#0096B4] transition-colors shadow-lg shadow-blue-200 text-sm">Next Step</button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        {studentType === 'enrolled' ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                                <h4 className="font-bold text-yellow-800 text-sm mb-1">Parent Connection</h4>
                                <p className="text-xs text-yellow-700">We'll send a referral code to your parent to link your accounts.</p>
                            </div>
                        ) : null}

                        <h3 className="font-bold text-gray-900 text-lg">Final Details</h3>

                        {studentType === 'enrolled' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent's Phone</label>
                                    <input type="tel" name="parentPhone" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent's Email</label>
                                    <input type="email" name="parentEmail" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none" />
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Course Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, courseLevel: level })}
                                        className={`py-2 px-1 rounded-lg text-sm font-bold border transition-all ${formData.courseLevel === level ? 'bg-[#00B4D8] text-white border-[#00B4D8]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={handleBack} className="w-full py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors">Back</button>
                            <button className="w-full bg-[#00B4D8] text-white font-semibold py-3 rounded-xl hover:bg-[#0096B4] transition-colors shadow-lg shadow-blue-200 flex items-center justify-center px-1">
                               Complete Registration
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
