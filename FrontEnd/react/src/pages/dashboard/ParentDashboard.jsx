import { Users, BookOpen, Trophy, TrendingUp, Lightbulb } from "lucide-react";

export default function ParentDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, Kebede!</h1>
                <p className="text-gray-600 mt-1">Monitor your children's learning progress</p>
            </div>

            {/* Monthly Recognition Alert */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 flex gap-4 items-start">
                <div className="bg-yellow-100 p-2 rounded-full text-[#FDB813] flex-shrink-0">
                    <Trophy className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-[#FDB813] font-bold mb-1">Monthly Recognition</h3>
                    <p className="text-yellow-800 text-sm leading-relaxed mb-2">
                        Dear Kebede Alemu, thank you for your unwavering commitment to quality education. Your dedication to your children's learning journey is transforming their future. Together, we are shaping Ethiopia's next generation of innovators!
                    </p>
                    <p className="text-xs text-yellow-600 italic">— With gratitude, The AbriTech Team</p>
                </div>
            </div>

            {/* Stats Cards - Children */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#00B4D8]">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">2</h3>
                        <p className="text-sm text-gray-500">Children</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">4</h3>
                        <p className="text-sm text-gray-500">Course Enrollments</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-[#FDB813]">
                        <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">5</h3>
                        <p className="text-sm text-gray-500">Lessons Completed</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">92%</h3>
                        <p className="text-sm text-gray-500">Avg Quiz Score</p>
                    </div>
                </div>
            </div>

            {/* Tip Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
                <div className="bg-blue-100 p-2 rounded-full text-[#00B4D8] flex-shrink-0">
                    <Lightbulb className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-[#00B4D8] font-bold mb-1">Tip: Set Screen Time Boundaries</h3>
                    <p className="text-blue-800 text-sm leading-relaxed">
                        While learning requires screen time, balance is important. Encourage breaks every 45-60 minutes. Use the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.
                    </p>
                </div>
            </div>
        </div>
    );
}
