import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    Clock,
    CheckCircle,
    Lock,
    PlayCircle,
    Link as LinkIcon,
    File,
    HelpCircle,
    Check,
    Plus,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { lessonService } from "../../lib/lessonService";
import api from "../../lib/api";
import Loading from "../../components/Loading";
import FeedbackModal from "../../components/FeedbackModal";

export default function LessonPlayer() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { refreshDashboardData, fetchAssignments } = useStudent();
    const [lessons, setLessons] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' or 'assignments'
    const [activeLesson, setActiveLesson] = useState(null);
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    // Quiz states
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [submittingQuiz, setSubmittingQuiz] = useState(false);

    // Completion delay state
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
    const [canComplete, setCanComplete] = useState(false);

    // Assignment submission states
    const [submissionType, setSubmissionType] = useState('text'); // 'text' or 'file'
    const [submissionText, setSubmissionText] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submittingAssignment, setSubmittingAssignment] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingFinalSubmit, setPendingFinalSubmit] = useState(false);

    // Feedback Modal State
    const [feedbackModal, setFeedbackModal] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lessonResponse, assignmentData] = await Promise.all([
                    lessonService.getLessons(courseId),
                    fetchAssignments(courseId)
                ]);

                const lessonList = lessonResponse.lessons || [];
                setLessons(lessonList);
                setAssignments(assignmentData || []);

                // Set initial active lesson
                const firstActive = lessonList.find(l => !l.isLocked && !l.isCompleted)
                    || lessonList.find(l => !l.isLocked)
                    || lessonList[0];

                if (firstActive) {
                    setActiveLesson(firstActive);
                    setQuizResult(firstActive.quizResult || null);
                    if (firstActive.isCompleted) setCanComplete(true);
                }
            } catch (error) {
                console.error("Failed to load course data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, fetchAssignments]);

    // Timer logic for lesson completion
    useEffect(() => {
        if (activeLesson && !activeLesson.isCompleted) {
            // If it's a video, we don't use a timer.
            // Completion is enabled when the video starts playing.
            // Set canComplete based on contentType
            if (activeLesson.contentType === 'quiz') {
                setCanComplete(false);
                setTimeLeft(0);
                // Reset quiz states for new quiz item
                setQuizAnswers({});
                setQuizResult(null);
                return;
            }

            // Check if lesson has video content (either type='video' or has a video resource)
            const hasVideo = activeLesson.type === 'video' || activeLesson.resources?.some(r => r.type === 'video');

            if (hasVideo) {
                setCanComplete(false);
                setTimeLeft(0);
                return;
            }

            // Reset quiz states for new lesson if it has a quiz
            setQuizAnswers({});
            setQuizResult(null);

            // If a lesson has a quiz, completion is gated by quiz
            if (activeLesson.quiz && activeLesson.quiz.length > 0) {
                setCanComplete(false);
                setTimeLeft(0);
                return;
            }

            setTimeLeft(60);
            setCanComplete(false);

            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanComplete(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        } else {
            setCanComplete(true);
        }
    }, [activeLesson?.id, activeLesson?.type]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(1, '0')}`;
    };

    const handleLessonSelect = (lesson) => {
        if (!lesson.isLocked) {
            setActiveLesson(lesson);
            setActiveAssignment(null);
            setQuizAnswers({});
            setQuizResult(lesson.quizResult || null);
            setCanComplete(lesson.isCompleted || !!lesson.quizResult);
        }
    };

    const handleMarkComplete = async () => {
        if (!activeLesson || !canComplete) return;
        setCompleting(true);
        try {
            await lessonService.markComplete(activeLesson.id);

            // Refresh global student data to sync levels/progress/stats
            refreshDashboardData();

            const response = await lessonService.getLessons(courseId);
            setLessons(response.lessons || []);

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

    const handleSubmitQuiz = async () => {
        if (Object.keys(quizAnswers).length < activeLesson.quiz.length) {
            showFeedback("Incomplete Quiz", "Please answer all questions before submitting.", "warning");
            return;
        }
        setSubmittingQuiz(true);
        try {
            const result = await lessonService.submitQuiz(activeLesson.id, quizAnswers);
            setQuizResult(result);
            setCanComplete(true);

            // Update the lesson in our list with the result to prevent retake during same session
            setLessons(prev => prev.map(l => l.id === activeLesson.id ? { ...l, quizResult: result, isCompleted: true } : l));
        } catch (error) {
            console.error("Quiz submission failed", error);
            if (error.response?.status === 403) {
                showFeedback("Access Denied", error.response.data.message, "error");
            } else {
                showFeedback("Submission Error", "Failed to submit quiz. Please try again.", "error");
            }
        } finally {
            setSubmittingQuiz(false);
        }
    };

    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://abritech.onrender.com';

    const renderQuiz = () => {
        if (!activeLesson.quiz || activeLesson.quiz.length === 0) return null;

        return (
            <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-primary/5 p-8 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Lesson Quiz</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Test your knowledge to proceed</p>
                            </div>
                        </div>
                        {quizResult?.passed && (
                            <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Check className="w-4 h-4" /> Passed
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 space-y-12">
                    {activeLesson.quiz.map((q, qIdx) => (
                        <div key={q.id} className="space-y-6">
                            <div className="flex gap-4">
                                <span className="text-2xl font-black text-primary/20">{qIdx + 1}</span>
                                <h4 className="text-xl font-bold text-gray-800 leading-snug">{q.question}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-10">
                                {['optionA', 'optionB', 'optionC', 'optionD'].map((opt) => (
                                    <button
                                        key={opt}
                                        disabled={quizResult}
                                        onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                        className={`p-4 rounded-2xl text-left font-bold transition-all border ${quizAnswers[q.id] === opt
                                            ? 'bg-primary/5 border-primary text-primary shadow-sm'
                                            : 'bg-white border-gray-100 text-gray-600 hover:border-primary/30 hover:bg-slate-50'
                                            } ${quizResult && q.correctOption === opt ? 'bg-green-50 border-green-500 text-green-700' : ''}
                                               ${quizResult && quizAnswers[q.id] === opt && q.correctOption !== opt ? 'bg-rose-50 border-rose-500 text-rose-700' : ''}
                                            `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${quizAnswers[q.id] === opt ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-400'}`}>
                                                {opt.slice(-1)}
                                            </div>
                                            {q[opt]}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50/50 p-8 flex flex-col items-center gap-6 border-t border-gray-100">
                    {quizResult && (
                        <div className="text-center space-y-2 animate-in fade-in zoom-in duration-300">
                            <p className="text-primary font-black text-xl">Quiz Results</p>
                            <p className="text-gray-500 font-bold text-sm">You got {quizResult.correctCount} out of {quizResult.totalQuestions} correct.</p>
                            <p className="text-gray-400 font-medium text-xs tracking-wide">Review your answers above and click "Mark as Complete" to proceed.</p>
                        </div>
                    )}

                    {!quizResult && (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={submittingQuiz || Object.keys(quizAnswers).length < activeLesson.quiz.length}
                            className="px-12 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50 disabled:grayscale"
                        >
                            {submittingQuiz ? 'Checking answers...' : 'Submit Quiz'}
                            <HelpCircle className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const handleSubmitAssignment = async (e) => {
        e.preventDefault();
        setSubmittingAssignment(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('submissionType', submissionType);

            if (submissionType === 'text') {
                formData.append('submissionContent', submissionText);
            } else if (submissionFile) {
                formData.append('file', submissionFile);
                formData.append('submissionContent', submissionFile.name);
            } else {
                showFeedback("Missing Content", "Please provide content or select a file.", "warning");
                setSubmittingAssignment(false);
                return;
            }

            // Using axios (via api.js) for upload progress if possible, 
            // but api.js uses standard axios. I'll use a standard post for now.
            // For file progress, I could use XHR, but let's stick to axios/api.

            const isFinalSubmit = formData.get('isFinal') === 'true';
            const response = await api.post(`/assignments/${activeAssignment.id}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            showFeedback(
                isFinalSubmit ? "Work Submitted" : "Draft Saved",
                isFinalSubmit ? "Assignment submitted successfully!" : "Draft saved successfully!",
                "success"
            );
            if (isFinalSubmit) {
                setSubmissionText('');
                setSubmissionFile(null);
            }
            setUploadProgress(0);
            setShowConfirmModal(false);

            // Refresh assignments list to show updated status
            const updatedAssignments = await fetchAssignments(courseId);
            setAssignments(updatedAssignments || []);

            // Optionally set active assignment again to refresh its data
            const refreshed = (updatedAssignments || []).find(a => a.id === activeAssignment.id);
            if (refreshed) setActiveAssignment(refreshed);

        } catch (error) {
            console.error("Submission failed", error);
            showFeedback("Submission Failed", error.response?.data?.message || "Failed to submit assignment", "error");
        } finally {
            setSubmittingAssignment(false);
        }
    };

    const renderContent = () => {
        if (activeAssignment) {
            return (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="border-b border-gray-100 pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-500 mb-2">
                                <File className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Project Assignment</span>
                            </div>
                            {activeAssignment.status && (
                                <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm ${activeAssignment.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100 shadow-green-100/50' :
                                    activeAssignment.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/50' :
                                        activeAssignment.status === 'pending' ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50' :
                                            'bg-yellow-50 text-yellow-600 border-yellow-100 shadow-yellow-100/50'
                                    }`}>
                                    Status: {activeAssignment.status === 'pending' ? 'Reviewing' : activeAssignment.status === 'approved' ? 'Graded' : activeAssignment.status || 'Draft'}
                                </div>
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">{activeAssignment.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                            {activeAssignment.dueDate && (
                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> Due: {new Date(activeAssignment.dueDate).toLocaleDateString()}</span>
                            )}
                            {activeAssignment.submittedAt && (
                                <span className="flex items-center gap-1.5 text-green-600"><CheckCircle className="w-4 h-4" /> Submitted: {new Date(activeAssignment.submittedAt).toLocaleDateString()}</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm min-h-[400px]">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Instructions</h3>
                        <div className="whitespace-pre-wrap font-medium text-gray-600 leading-relaxed text-lg mb-8">
                            {activeAssignment.description}
                        </div>

                        <div className="pt-8 border-t border-gray-50">
                            <h3 className="text-2xl font-black text-gray-900 mb-6">Your Submission</h3>

                            <div className="flex bg-gray-50 p-1 rounded-2xl mb-6 max-w-sm">
                                <button
                                    onClick={() => setSubmissionType('text')}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${submissionType === 'text' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Write Text
                                </button>
                                <button
                                    onClick={() => setSubmissionType('file')}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${submissionType === 'file' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Upload File
                                </button>
                            </div>

                            <form onSubmit={handleSubmitAssignment} className="space-y-6">
                                {submissionType === 'text' ? (
                                    <textarea
                                        value={submissionText || (activeAssignment.submissionType === 'text' ? activeAssignment.submissionContent : '')}
                                        onChange={(e) => setSubmissionText(e.target.value)}
                                        placeholder="Type your project content or paste links here..."
                                        className="w-full min-h-[250px] p-6 rounded-[2rem] border border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        required
                                        disabled={activeAssignment.status && activeAssignment.status !== 'draft'}
                                    />
                                ) : (
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={(e) => setSubmissionFile(e.target.files[0])}
                                            className={`absolute inset-0 w-full h-full opacity-0 z-10 ${activeAssignment.status && activeAssignment.status !== 'draft' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.mp4,.mkv"
                                            disabled={activeAssignment.status && activeAssignment.status !== 'draft'}
                                        />
                                        <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center group-hover:border-primary/50 transition-colors bg-gray-50/50">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                <Plus className="w-8 h-8" />
                                            </div>
                                            <p className="text-gray-900 font-bold mb-1">
                                                {submissionFile ? submissionFile.name : (activeAssignment.submissionType === 'file' ? activeAssignment.submissionContent : 'Click to upload your project file')}
                                            </p>
                                            <p className="text-gray-400 text-sm font-medium">Max size: 125MB. Supports PDF, DOC, Video, Images.</p>
                                        </div>
                                    </div>
                                )}

                                {submittingAssignment && uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-primary uppercase tracking-widest">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-300 rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setSubmittingAssignment(true);
                                            const formData = new FormData();
                                            formData.append('submissionType', submissionType);
                                            formData.append('isFinal', 'false');
                                            if (submissionType === 'text') formData.append('submissionContent', submissionText);
                                            else if (submissionFile) {
                                                formData.append('file', submissionFile);
                                                formData.append('submissionContent', submissionFile.name);
                                            }
                                            try {
                                                await api.post(`/assignments/${activeAssignment.id}/submit`, formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                showFeedback("Draft Saved", "Draft saved successfully!", "success");
                                                const updated = await fetchAssignments(courseId);
                                                setAssignments(updated || []);
                                            } catch (err) {
                                                showFeedback("Error", err.response?.data?.message || "Failed to save draft", "error");
                                            } finally {
                                                setSubmittingAssignment(false);
                                            }
                                        }}
                                        disabled={submittingAssignment || (activeAssignment.status && activeAssignment.status !== 'draft')}
                                        className="flex-1 py-4 px-3 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save Draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (activeAssignment.dueDate && new Date() > new Date(activeAssignment.dueDate)) {
                                                showFeedback("Deadline Passed", "Cannot submit final work: The submission window has closed.", "warning");
                                                return;
                                            }
                                            setShowConfirmModal(true);
                                        }}
                                        disabled={submittingAssignment || (activeAssignment.status && activeAssignment.status !== 'draft') || (submissionType === 'text' ? !submissionText : !submissionFile)}
                                        className="flex-1 py-4 px-3 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
                                    >
                                        {submittingAssignment ? 'Uploading...' : 'Submit Final Work'}
                                    </button>
                                </div>
                                {activeAssignment.status && activeAssignment.status !== 'draft' ? (
                                    <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Teacher's Assessment</h4>
                                            {activeAssignment.score !== null && (
                                                <span className="text-xl font-black text-primary">{activeAssignment.score}/{activeAssignment.maxScore}</span>
                                            )}
                                        </div>
                                        {activeAssignment.feedback ? (
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{activeAssignment.feedback}"</p>
                                        ) : (
                                            <p className="text-sm font-bold text-slate-400">Your project is currently under review by the instructor.</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="mt-6 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                                        Note: Resubmission is not allowed after final submission.
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Confirmation Modal */}
                    {showConfirmModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                                    <AlertCircle className="w-10 h-10 text-amber-500" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Ready to submit?</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        Once you submit your work for review, you won't be able to edit or resubmit it. Make sure everything is correct!
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        Wait, Let me check
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setSubmittingAssignment(true);
                                            const formData = new FormData();
                                            formData.append('submissionType', submissionType);
                                            formData.append('isFinal', 'true');
                                            if (submissionType === 'text') formData.append('submissionContent', submissionText);
                                            else if (submissionFile) {
                                                formData.append('file', submissionFile);
                                                formData.append('submissionContent', submissionFile.name);
                                            }
                                            try {
                                                await api.post(`/assignments/${activeAssignment.id}/submit`, formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' },
                                                    onUploadProgress: (progressEvent) => {
                                                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                                        setUploadProgress(progress);
                                                    }
                                                });
                                                showFeedback("Work Submitted", "Assignment submitted for review successfully!", "success");
                                                setSubmissionText('');
                                                setSubmissionFile(null);
                                                setShowConfirmModal(false);
                                                const updated = await fetchAssignments(courseId);
                                                setAssignments(updated || []);
                                                const refreshed = (updated || []).find(a => a.id === activeAssignment.id);
                                                if (refreshed) setActiveAssignment(refreshed);
                                            } catch (err) {
                                                showFeedback("Submission Error", err.response?.data?.message || "Failed to submit assignment", "error");
                                            } finally {
                                                setSubmittingAssignment(false);
                                            }
                                        }}
                                        className="flex-1 py-4 px-3  text-black  rounded-2xl font-black text-xs uppercase tracking-widest  hover:bg-gray-200 transition-all"
                                    >
                                        Yes, Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (!activeLesson) return <div className="text-gray-500 text-center py-20">Select a lesson or project from the sidebar to continue.</div>;

        const { title, description, resources } = activeLesson;
        const lessonResources = resources || (activeLesson.type ? [{
            type: activeLesson.type,
            contentUrl: activeLesson.contentUrl,
            textContent: activeLesson.textContent
        }] : []);

        if (activeLesson.contentType === 'quiz') {
            return (
                <div className="space-y-6 animate-in fade-in duration-500 pb-20">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">{activeLesson.title}</h2>
                        <div className="flex flex-wrap gap-4 mb-8">
                            <span className="px-5 py-2 bg-primary/5 text-primary rounded-xl text-xs font-black uppercase tracking-widest border border-primary/10">Independent Quiz</span>
                            <span className="px-5 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-100">{activeLesson.description}</span>
                        </div>
                        {renderQuiz()}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-in fade-in duration-500 pb-20">
                {/* Mobile Back Button */}
                <button
                    onClick={() => { setActiveLesson(null); setActiveAssignment(null); }}
                    className="lg:hidden flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-4 bg-primary/5 px-4 py-2 rounded-xl"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Playlist
                </button>

                <div className="border-b border-gray-100 pb-6">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{title}</h1>
                    <p className="text-gray-500 font-medium">{description}</p>
                </div>

                {lessonResources.map((res, index) => {
                    const fullContentUrl = res.contentUrl?.startsWith('http') ? res.contentUrl : `${API_BASE_URL}/${res.contentUrl}`;

                    return (
                        <div key={index} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm mb-8 last:mb-0">
                            {/* Main Content Rendering */}
                            {res.type === 'video' && fullContentUrl && (
                                <video
                                    key={fullContentUrl}
                                    controls
                                    onEnded={() => setCanComplete(true)}
                                    className="w-full h-full object-contain bg-black max-h-[600px]"
                                >
                                    <source src={fullContentUrl} />
                                    Your browser does not support the video tag.
                                </video>
                            )}

                            {res.type === 'image' && fullContentUrl && (
                                <img src={fullContentUrl} alt={title} className="w-full h-auto object-contain" />
                            )}

                            {res.type === 'link' && fullContentUrl && (
                                <div className="flex flex-col items-center justify-center min-h-[300px] bg-slate-50 gap-6 p-8 text-center border-b border-slate-50">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500">
                                        <LinkIcon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">External Content</h3>
                                        <a
                                            href={fullContentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-[#00B4D8] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0096B4] transition-all"
                                        >
                                            Open Link <LinkIcon className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {res.type === 'file' && fullContentUrl && (
                                <div className="flex flex-col items-center justify-center min-h-[300px] bg-slate-50 gap-6 p-8 text-center border-b border-slate-50">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-purple-500">
                                        <File className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Downloadable Resource</h3>
                                        <a
                                            href={fullContentUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all"
                                        >
                                            Download File <File className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Text Content Rendering (Always if exists, or if type is text) */}
                            {(res.textContent || res.type === 'text') && (
                                <div className={`p-8 md:p-10 prose prose-slate max-w-none ${res.type !== 'text' ? 'bg-slate-50/20' : ''}`}>
                                    <div className={`whitespace-pre-wrap font-medium text-gray-600 leading-relaxed ${res.type === 'text' ? 'text-lg' : 'text-base'}`}>
                                        {res.textContent}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {lessonResources.length === 0 && activeLesson.contentType !== 'quiz' && <div className="p-10 text-center text-gray-400 font-bold">No content available for this lesson.</div>}

                {/* Quiz Section (for lessons with quizzes) */}
                {activeLesson.contentType === 'lesson' && activeLesson.quiz && activeLesson.quiz.length > 0 && renderQuiz()}

                <div className="flex justify-end pt-4">
                    {!activeLesson.isCompleted && (
                        <button
                            onClick={handleMarkComplete}
                            disabled={completing || !canComplete}
                            className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${!canComplete
                                ? 'bg-gray-100 text-gray-400 shadow-none'
                                : 'bg-[#00B4D8] text-white shadow-blue-500/20 hover:bg-[#0096B4]'
                                }`}
                        >
                            {completing
                                ? 'Completing...'
                                : !canComplete
                                    ? (activeLesson.type === 'video' || activeLesson.resources?.some(r => r.type === 'video'))
                                        ? 'Watch video to complete'
                                        : `Complete in ${formatTime(timeLeft)}`
                                    : 'Mark as Complete'}
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
                {/* Sidebar (Lesson & Assignment List) */}
                <div className={`w-full lg:w-96 border-r border-gray-100 bg-gray-50/50 flex flex-col h-full lg:h-auto overflow-hidden ${(activeLesson || activeAssignment) ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-6 border-b border-gray-100 bg-white">
                        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-900 font-bold flex items-center gap-2 mb-4 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to Course
                        </button>

                        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                            <button
                                onClick={() => setActiveTab('lessons')}
                                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'lessons' ? 'bg-white text-[#00B4D8] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Lessons
                            </button>
                            <button
                                onClick={() => setActiveTab('assignments')}
                                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'assignments' ? 'bg-white text-[#00B4D8] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Projects
                            </button>
                        </div>

                        <h2 className="text-xl font-black text-gray-900">{activeTab === 'lessons' ? 'Course Content' : 'Course Projects'}</h2>
                        <div className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {activeTab === 'lessons' ? (
                                <><Clock className="w-4 h-4" /> {lessons.filter(l => l.isCompleted).length} / {lessons.length} Completed</>
                            ) : (
                                <><File className="w-4 h-4" /> {assignments.length} Total Projects</>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {activeTab === 'lessons' ? (
                            lessons.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 font-bold">No lessons yet</div>
                            ) : (
                                lessons.map((lesson, idx) => (
                                    <button
                                        key={lesson.id}
                                        onClick={() => {
                                            setActiveLesson(lesson);
                                            setActiveAssignment(null);
                                        }}
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
                                                    lesson.contentType === 'quiz' ? <HelpCircle className="w-4 h-4" /> :
                                                        <span className="text-xs font-black">{idx + 1}</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${activeLesson?.id === lesson.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {lesson.contentType === 'quiz' ? `Quiz: ${lesson.title}` : lesson.title}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                                {lesson.contentType === 'quiz' ? 'Quiz Content' : (lesson.type || 'Lesson')}
                                            </p>
                                        </div>
                                        {activeLesson?.id === lesson.id && (
                                            <PlayCircle className="w-5 h-5 text-[#00B4D8] animate-pulse" />
                                        )}
                                    </button>
                                ))
                            )
                        ) : (
                            assignments.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 font-bold">No projects assigned yet</div>
                            ) : (
                                assignments.map((assignment, idx) => (
                                    <button
                                        key={assignment.id}
                                        onClick={() => {
                                            setActiveAssignment(assignment);
                                            setActiveLesson(null);
                                        }}
                                        className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center gap-4 group ${activeAssignment?.id === assignment.id
                                            ? 'bg-white border-[#00B4D8] shadow-lg shadow-blue-500/5 ring-1 ring-[#00B4D8]/20'
                                            : 'bg-white border-transparent hover:border-gray-200 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeAssignment?.id === assignment.id ? 'bg-[#00B4D8] text-white' : 'bg-amber-100 text-amber-500'
                                            }`}>
                                            <File className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${activeAssignment?.id === assignment.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {assignment.title}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                                Assignment
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 h-full overflow-y-auto bg-white p-6 lg:p-10 ${(activeLesson || activeAssignment) ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="max-w-4xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </div>
            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
            />
        </div>
    );
}
