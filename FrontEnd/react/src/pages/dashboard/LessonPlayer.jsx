import { useNavigate, useParams } from "react-router-dom";
import { PlayCircle, ChevronLeft, Layout, BookOpen, Clock } from "lucide-react";

export default function LessonPlayer() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background elements for premium feel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
                <div className="w-[500px] h-[500px] bg-[#00B4D8] rounded-full opacity-5 blur-3xl animate-pulse"></div>
            </div>

            <div className="max-w-2xl w-full text-center space-y-10 relative z-10">
                {/* Visual Indicator */}
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-white rounded-[2rem] border border-gray-100 shadow-xl flex items-center justify-center text-[#00B4D8] transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                        <PlayCircle className="h-10 w-10 fill-current opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Layout className="h-8 w-8 text-[#00B4D8]" />
                        </div>
                    </div>
                    {/* Floating accents */}
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#FDB813] rounded-xl flex items-center justify-center shadow-lg transform rotate-12 scale-90">
                        <Clock className="h-5 w-5 text-white" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <span className="text-[#00B4D8] font-black uppercase tracking-[0.3em] text-[10px]">Curriculum update in progress</span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight uppercase">
                        Lessons <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4D8] to-blue-600">Coming Soon</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-lg mx-auto">
                        We're currently perfecting the course material to ensure you get the absolute best learning experience. Check back soon for the full curriculum!
                    </p>
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                    {[
                        { icon: BookOpen, label: "Interactive Content" },
                        { icon: Layout, label: "Hands-on Projects" },
                        { icon: PlayCircle, label: "HD Video Lessons" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#00B4D8]">
                                <item.icon className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight text-gray-600">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="pt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="group inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#00B4D8] transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
                    >
                        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

