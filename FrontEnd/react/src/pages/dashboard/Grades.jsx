import React, { useState, useEffect } from "react";
import { TrendingUp, Award, FileText, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../lib/api";
import Loading from "../../components/Loading";

export default function Grades() {
    const [courseGrades, setCourseGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCourses, setExpandedCourses] = useState({});

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await api.get("/students/grades");
                setCourseGrades(response.data);
                // Expand the first course by default
                if (response.data.length > 0) {
                    setExpandedCourses({ [response.data[0].courseName]: true });
                }
            } catch (err) {
                console.error("Failed to fetch grades", err);
                setError("Failed to load your grades. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, []);

    const toggleExpand = (courseName) => {
        setExpandedCourses(prev => ({
            ...prev,
            [courseName]: !prev[courseName]
        }));
    };

    if (loading) return <Loading fullScreen={false} message="Fetching your results..." />;

    if (error) return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-rose-100 shadow-sm text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-500">{error}</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Academic Transcripts</h1>
                <p className="text-gray-500 mt-2 font-medium">Your official performance record for all enrolled courses.</p>
            </header>

            {courseGrades.length === 0 ? (
                <div className="p-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
                    <TrendingUp className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">No results yet</h2>
                    <p className="text-gray-500 max-w-md mx-auto">Complete quizzes and submit projects in your courses to generate your transcripts.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {courseGrades.map((course, idx) => {
                        const isExpanded = expandedCourses[course.courseName];
                        const totalQuizScore = course.quizzes.reduce((acc, q) => acc + q.score, 0);
                        const avgQuizScore = course.quizzes.length > 0 ? Math.round(totalQuizScore / course.quizzes.length) : 0;

                        return (
                            <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => toggleExpand(course.courseName)}
                                    className="w-full flex items-center justify-between p-8 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center shrink-0">
                                            <TrendingUp className="w-7 h-7" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-xl font-black text-gray-900">{course.courseName}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Award className="w-3.5 h-3.5 text-amber-500" /> Avg. Quiz: {avgQuizScore}%
                                                </p>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5 text-blue-500" /> {course.assignments.length} Projects
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-6 h-6 text-gray-300" /> : <ChevronDown className="w-6 h-6 text-gray-300" />}
                                </button>

                                {isExpanded && (
                                    <div className="p-8 pt-0 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                                            {/* Quizzes Table */}
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                    <Award className="w-4 h-4 text-amber-500" /> Quiz Results
                                                </h4>
                                                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/30">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Topic</th>
                                                                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Score</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {course.quizzes.map((q, qIdx) => (
                                                                <tr key={qIdx} className="bg-white hover:bg-gray-50/50 transition-colors">
                                                                    <td className="p-4">
                                                                        <p className="font-bold text-gray-800">{q.lessonTitle}</p>
                                                                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{new Date(q.date).toLocaleDateString()}</p>
                                                                    </td>
                                                                    <td className="p-4 text-right">
                                                                        <span className={`text-sm font-black ${q.score >= 70 ? 'text-green-500' : q.score >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                                            {q.score}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {course.quizzes.length === 0 && (
                                                                <tr>
                                                                    <td colSpan="2" className="p-8 text-center text-gray-400 italic text-xs">No quizzes yet.</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Projects Table */}
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-blue-500" /> Project Submissions
                                                </h4>
                                                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/30">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Project</th>
                                                                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Result</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {course.assignments.map((a, aIdx) => (
                                                                <tr key={aIdx} className="bg-white hover:bg-gray-50/50 transition-colors">
                                                                    <td className="p-4">
                                                                        <p className="font-bold text-gray-800">{a.title}</p>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <span className={`text-[9px] font-black uppercase tracking-tighter ${a.status === 'approved' ? 'text-green-500' : 'text-amber-500'}`}>{a.status}</span>
                                                                            <span className="text-[10px] text-gray-300">•</span>
                                                                            <p className="text-[10px] font-bold text-gray-400">{new Date(a.date).toLocaleDateString()}</p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 text-center">
                                                                        {a.score !== null ? (
                                                                            <span className="text-sm font-black text-primary">{a.score}/{a.maxScore}</span>
                                                                        ) : (
                                                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${a.status === 'pending' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
                                                                                {a.status === 'pending' ? 'Reviewing' : 'Draft'}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {course.assignments.length === 0 && (
                                                                <tr>
                                                                    <td colSpan="2" className="p-8 text-center text-gray-400 italic text-xs">No projects yet.</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
