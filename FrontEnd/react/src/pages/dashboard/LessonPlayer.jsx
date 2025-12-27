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

export default function LessonPlayer() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] -m-4 sm:-m-6 lg:-m-8">
            {/* Player Header */}
            <div className="bg-gray-900 text-white h-16 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/dashboard/student/courses/${courseId}`)}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{lesson.title}</h1>
                        <p className="text-xs text-gray-400 hidden md:block">Module 2: Control Flow • Lesson 4/12</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAISummary(!showAISummary)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${showAISummary ? 'bg-[#00B4D8] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">AI Summary</span>
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Video Player Wrapper */}
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
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
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                <button className="flex items-center gap-2 text-gray-600 hover:text-[#00B4D8] font-bold text-sm transition-colors">
                                    <ThumbsUp className="h-5 w-5" /> Like
                                </button>
                                <button className="flex items-center gap-2 text-gray-600 hover:text-[#00B4D8] font-bold text-sm transition-colors">
                                    <Download className="h-5 w-5" /> Resources
                                </button>
                            </div>
                            <button className="bg-[#00B4D8] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#0096B4] transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" /> Mark as Complete
                            </button>
                        </div>

                        {/* Text Content */}
                        <div className="prose prose-blue max-w-none text-gray-600">
                            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                        </div>
                    </div>
                </div>

                {/* AI Summary Sidebar (Overlay) */}
                <div className={cn(
                    "absolute top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-20 border-l border-gray-100 p-6 overflow-y-auto",
                    showAISummary ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#00B4D8]">
                                <MessageSquare className="h-4 w-4" />
                            </div>
                            AI Helper
                        </h3>
                        <button onClick={() => setShowAISummary(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-900 leading-relaxed border border-blue-100">
                            <strong>Lesson Summary:</strong><br />
                            This lesson introduces Python's `if`, `elif`, and `else` statements for decision making. You learned syntax structure and indentation rules critical for running code without errors.
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-100">
                            <strong>Key Concept:</strong><br />
                            Indentation in Python is not just for readability; it defines the block of code to be executed.
                        </div>
                    </div>
                </div>

                {/* Course Sidebar (Right Side on Desktop) */}
                <div className={cn(
                    "fixed inset-y-0 right-0 lg:static lg:block w-80 bg-white border-l border-gray-200 transform transition-transform duration-200 z-10 flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "translate-x-full",
                    // On mobile, this covers entire screen or pushes differently, simplified here for desktop-first layout within constraints
                    "lg:translate-x-0"
                )}>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center lg:hidden">
                        <span className="font-bold">Course Content</span>
                        <button onClick={() => setIsSidebarOpen(false)}><X className="h-5 w-5" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Mock Module List */}
                        {[1, 2, 3].map(module => (
                            <div key={module} className="space-y-2">
                                <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Module {module}</h4>
                                <div className="space-y-1">
                                    {[1, 2, 3].map(l => (
                                        <button key={l} className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${l === 1 && module === 2 ? 'bg-[#00B4D8]/10 text-[#00B4D8] font-bold' : 'hover:bg-gray-50 text-gray-600'}`}>
                                            {l < 2 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <PlayCircle className="h-4 w-4" />}
                                            <span className="text-sm truncate flex-1">Lesson Title Here</span>
                                            <span className="text-xs opacity-50">10m</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
