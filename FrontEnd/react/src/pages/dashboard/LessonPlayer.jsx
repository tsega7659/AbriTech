import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { PlayCircle, ChevronLeft, Lock, CheckCircle, FileText, Layout, Clock, Video, Image as ImageIcon, Link as LinkIcon, File } from "lucide-react";
import { lessonService } from "../../lib/lessonService";
import Loading from "../../components/Loading";

export default function LessonPlayer() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await lessonService.getLessons(courseId);
                // response is { lessons: [...] }
                const lessonList = response.lessons || [];
                setLessons(lessonList);

                // Set initial active lesson: First unlocked & uncompleted, or last unlocked
                const firstActive = lessonList.find(l => !l.isLocked && !l.isCompleted)
                    || lessonList.find(l => !l.isLocked)
                    || lessonList[0];
                setActiveLesson(firstActive);
            } catch (error) {
                console.error("Failed to load lessons", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, [courseId]);

    const handleLessonSelect = (lesson) => {
        if (!lesson.isLocked) {
            setActiveLesson(lesson);
        }
    };

    const handleMarkComplete = async () => {
        if (!activeLesson) return;
        setCompleting(true);
        try {
            await lessonService.markComplete(activeLesson.id);

            // Refresh lessons to update lock status
            const response = await lessonService.getLessons(courseId);
            setLessons(response.lessons || []);

            // Auto-advance to next lesson if available
            const nextLesson = response.lessons.find(l => l.orderNumber > activeLesson.orderNumber);
            if (nextLesson && !nextLesson.isLocked) {
                setActiveLesson(nextLesson);
            }
        } catch (error) {
            console.error("Failed to complete lesson", error);
        } finally {
            setCompleting(false);
        }
    };

    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://abritech.onrender.com';

    const renderContent = () => {
        if (!activeLesson) return <div className="text-gray-500">Select a lesson to start</div>;

        const { type, contentUrl, textContent, title, description } = activeLesson;
        const fullContentUrl = contentUrl?.startsWith('http') ? contentUrl : `${API_BASE_URL}/${contentUrl}`;

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="border-b border-gray-100 pb-6">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{title}</h1>
                    <p className="text-gray-500 font-medium">{description}</p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm min-h-[400px]">
                    {type === 'video' && fullContentUrl && (
                        <video controls className="w-full h-full object-contain bg-black max-h-[600px]">
                            <source src={fullContentUrl} />
                            Your browser does not support the video tag.
                        </video>
                    )}

                    {type === 'image' && fullContentUrl && (
                        <img src={fullContentUrl} alt={title} className="w-full h-auto object-contain" />
                    )}

                    {type === 'text' && (
                        <div className="p-8 md:p-12 prose prose-slate max-w-none">
                            <div className="whitespace-pre-wrap font-medium text-gray-600 leading-relaxed text-lg">{textContent}</div>
                        </div>
                    )}

                    {type === 'link' && fullContentUrl && (
                        <div className="flex flex-col items-center justify-center h-[400px] bg-slate-50 gap-6 p-8 text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-blue-500">
                                <LinkIcon className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">External Content</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">This lesson content is hosted on an external site.</p>
                                <a
                                    href={fullContentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-[#00B4D8] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#0096B4] transition-all"
                                >
                                    Open Link <LinkIcon className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    )}

                    {type === 'file' && fullContentUrl && (
                        <div className="flex flex-col items-center justify-center h-[400px] bg-slate-50 gap-6 p-8 text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-purple-500">
                                <File className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Downloadable Resource</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">Download the attached file to complete this lesson.</p>
                                <a
                                    href={fullContentUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-purple-700 transition-all"
                                >
                                    Download File <File className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    )}

                    {!type && <div className="p-10 text-center text-gray-400 font-bold">No content available.</div>}
                </div>

                <div className="flex justify-end pt-4">
                    {!activeLesson.isCompleted && (
                        <button
                            onClick={handleMarkComplete}
                            disabled={completing}
                            className="bg-[#00B4D8] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#0096B4] transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {completing ? 'Completing...' : 'Mark as Complete'}
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    )}
                    {activeLesson.isCompleted && (
                        <div className="px-8 py-4 bg-green-50 text-green-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Completed
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) return <Loading fullScreen={false} message="Loading contents..." />;

    return (
        <div className="min-h-screen bg-white">
            <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
                {/* Sidebar (Lesson List) */}
                <div className="w-full lg:w-96 border-r border-gray-100 bg-gray-50/50 flex flex-col h-full lg:h-auto overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-white">
                        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-900 font-bold flex items-center gap-2 mb-4 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to Course
                        </button>
                        <h2 className="text-xl font-black text-gray-900">Course Content</h2>
                        <div className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <Clock className="w-4 h-4" /> {lessons.filter(l => l.isCompleted).length} / {lessons.length} Completed
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {lessons.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 font-bold">No lessons yet</div>
                        ) : (
                            lessons.map((lesson, idx) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => handleLessonSelect(lesson)}
                                    disabled={lesson.isLocked}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center gap-4 group ${activeLesson?.id === lesson.id
                                            ? 'bg-white border-[#00B4D8] shadow-lg shadow-blue-500/5 ring-1 ring-[#00B4D8]/20'
                                            : lesson.isLocked
                                                ? 'bg-gray-100/50 border-transparent opacity-60 cursor-not-allowed'
                                                : 'bg-white border-transparent hover:border-gray-200 hover:shadow-sm'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${lesson.isCompleted ? 'bg-green-100 text-green-600' :
                                            lesson.isLocked ? 'bg-gray-200 text-gray-400' :
                                                activeLesson?.id === lesson.id ? 'bg-[#00B4D8] text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {lesson.isCompleted ? <CheckCircle className="w-4 h-4" /> :
                                            lesson.isLocked ? <Lock className="w-4 h-4" /> :
                                                <span className="text-xs font-black">{idx + 1}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${activeLesson?.id === lesson.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {lesson.title}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                            {lesson.type}
                                        </p>
                                    </div>
                                    {activeLesson?.id === lesson.id && (
                                        <PlayCircle className="w-5 h-5 text-[#00B4D8] animate-pulse" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 h-full overflow-y-auto bg-white p-6 lg:p-10">
                    <div className="max-w-4xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
