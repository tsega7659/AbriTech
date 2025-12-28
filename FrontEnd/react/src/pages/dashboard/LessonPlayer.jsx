import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    CheckCircle,
    PlayCircle,
    FileText,
    MessageSquare,
    X,
    ThumbsUp,
    Download
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function LessonPlayer() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showAISummary, setShowAISummary] = useState(false);

    // Mock Lesson Data (would fetch based on IDs)
    const lesson = {
        title: "If/Else Statements",
        videoUrl: "https://www.youtube.com/embed/PKI-ZXPng4s?si=K-JjdDk-E7-Jj6J-", // Placeholder
        content: `
            <h3>Understanding Control Flow</h3>
            <p>Control flow is the order in which individual statements, instructions or function calls of an imperative program are executed or evaluated. The if statement is used for conditional execution.</p>
            <pre class="bg-gray-900 text-white p-4 rounded-lg my-4 font-mono text-sm">
if condition:
    # code to execute if condition is true
else:
    # code to execute if condition is false
            </pre>
            <p>In this lesson, we will explore how to use these statements effectively in your Python scripts.</p>
        `,
        resources: [
            { name: "Cheat Sheet.pdf", size: "1.2 MB" },
            { name: "Source Code.py", size: "2 KB" }
        ]
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] -m-4 sm:-m-6 lg:-m-10">
            {/* Player Header */}
            <div className="bg-gray-900 text-white h-20 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/dashboard/student/courses/${courseId}`)}
                        className="p-2 hover:bg-gray-800 rounded-xl transition-colors bg-gray-800/50"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div className="min-w-0">
                        <h1 className="font-black text-sm md:text-lg truncate max-w-[150px] sm:max-w-md tracking-tight">{lesson.title}</h1>
                        <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest hidden xs:block">Module 2 • Lesson 4/12</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAISummary(!showAISummary)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                            showAISummary ? 'bg-[#00B4D8] text-white shadow-lg shadow-blue-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        )}
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden md:inline uppercase tracking-tighter">AI Analysis</span>
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 lg:p-12">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* Video Player Wrapper */}
                        <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
                            <iframe
                                width="100%"
                                height="100%"
                                src={lesson.videoUrl}
                                title="Lesson Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>

                        {/* Lesson Controls */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 py-6 border-b border-gray-200">
                            <div className="flex items-center gap-6">
                                <button className="flex items-center gap-2 text-gray-500 hover:text-[#00B4D8] font-black text-xs uppercase tracking-widest transition-colors group">
                                    <ThumbsUp className="h-5 w-5 group-hover:scale-110 transition-transform" /> Like
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 hover:text-[#00B4D8] font-black text-xs uppercase tracking-widest transition-colors group">
                                    <Download className="h-5 w-5 group-hover:scale-110 transition-transform" /> Resources
                                </button>
                            </div>
                            <button className="w-full sm:w-auto bg-[#00B4D8] text-white px-8 py-4 rounded-[1.25rem] font-black text-sm uppercase tracking-widest hover:bg-[#0096B4] transition-all shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-3">
                                <CheckCircle className="h-5 w-5" /> Mark as Complete
                            </button>
                        </div>

                        {/* Text Content */}
                        <div className="prose prose-blue max-w-none text-gray-600 font-medium leading-relaxed prose-headings:font-black prose-headings:tracking-tight prose-pre:rounded-3xl prose-pre:p-6">
                            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                        </div>
                    </div>
                </div>

                {/* AI Summary Sidebar (Overlay) */}
                <AnimatePresence>
                    {showAISummary && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAISummary(false)}
                                className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30"
                            />
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-40 border-l border-gray-100 p-8 overflow-y-auto"
                            >
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="font-black text-xl text-gray-900 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-[#00B4D8] shadow-sm">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        AI Insights
                                    </h3>
                                    <button onClick={() => setShowAISummary(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-blue-50/50 p-6 rounded-3xl text-sm text-blue-900 leading-relaxed border border-blue-100/50">
                                        <p className="font-black uppercase tracking-widest text-[10px] text-blue-400 mb-2">Lesson Summary</p>
                                        This lesson introduces Python's `if`, `elif`, and `else` statements for decision making. You learned syntax structure and indentation rules critical for running code without errors.
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-3xl text-sm text-gray-600 border border-gray-100 font-medium">
                                        <p className="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-2">Key Concept</p>
                                        Indentation in Python is not just for readability; it defines the block of code to be executed.
                                    </div>
                                    <div className="pt-6">
                                        <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-xl shadow-gray-200">
                                            Ask me a question
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Course Sidebar (Right Side) */}
                <AnimatePresence>
                    {(isSidebarOpen || window.innerWidth >= 1024) && (
                        <>
                            {isSidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                                />
                            )}
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className={cn(
                                    "fixed inset-y-0 right-0 lg:static w-full sm:w-80 bg-white border-l border-gray-100 z-50 lg:z-10 flex flex-col",
                                    !isSidebarOpen && "hidden lg:flex"
                                )}
                            >
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center h-20">
                                    <span className="font-black uppercase tracking-widest text-xs text-gray-400">Course Content</span>
                                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl lg:hidden">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-8">
                                    {[1, 2, 3].map(module => (
                                        <div key={module} className="space-y-3">
                                            <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] px-4">Module {module}</h4>
                                            <div className="space-y-1 px-2">
                                                {[1, 2, 3].map(l => (
                                                    <button key={l} className={cn(
                                                        "w-full text-left p-3.5 rounded-2xl flex items-center gap-4 transition-all duration-200 group",
                                                        l === 1 && module === 2 ? 'bg-blue-50/50 text-[#00B4D8]' : 'hover:bg-gray-50 text-gray-600'
                                                    )}>
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                                                            l < 2 ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-[#00B4D8]'
                                                        )}>
                                                            {l < 2 ? <CheckCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold truncate">Lesson Title Here</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">10 min video</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
