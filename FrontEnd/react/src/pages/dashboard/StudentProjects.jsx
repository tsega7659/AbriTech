import React, { useState } from "react";
import { FolderGit2, CheckCircle2, Clock, PlayCircle, Star, Github } from "lucide-react";
import { useStudentDashboard, useGrades } from "../../hooks/useStudentQueries";
import Loading from "../../components/Loading";
import ProjectSubmissionModal from "../../components/ProjectSubmissionModal";

export default function StudentProjects() {
    const { data: dashboardData, isLoading } = useStudentDashboard();
    const { data: courseGrades = [], isLoading: gradesLoading } = useGrades();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    if (isLoading || gradesLoading) {
        return <Loading variant="inline" message="Loading your projects..." />;
    }

    const pendingProjects = dashboardData?.pendingProjects || [];

    // Build completed projects from graded assignment submissions across all courses
    const completedProjects = courseGrades.flatMap(course =>
        (course.assignments || [])
            .filter(a => a.score !== null && a.score !== undefined)
            .map(a => ({ ...a, courseName: course.courseName }))
    );

    const handleOpenSubmit = (proj) => {
        setSelectedAssignment(proj);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
                <p className="text-gray-600 mt-1">Manage pending assignments and review instructor feedback.</p>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Pending Submissions */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Action Required</h2>
                    </div>

                    <div className="space-y-4">
                        {pendingProjects.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center">
                                <FolderGit2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-bold text-gray-500">No pending projects!</p>
                            </div>
                        ) : (
                            pendingProjects.map(proj => (
                                <div key={proj.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-lg text-gray-900">{proj.title}</h3>
                                                {proj.status === 'redo' && (
                                                    <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-rose-100">
                                                        Redo Req
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-[#00B4D8] font-bold mt-1">{proj.courseName}</p>
                                        </div>
                                        <span className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shrink-0">
                                            Due {new Date(proj.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2">Complete the required implementation and submit your source code along with a demonstration video.</p>

                                    {proj.status === 'redo' && proj.feedback && (
                                        <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                                                <h4 className="font-bold text-xs text-orange-800 uppercase tracking-wider">Instructor Feedback</h4>
                                            </div>
                                            <p className="text-xs text-orange-700 italic">"{proj.feedback}"</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleOpenSubmit(proj)}
                                        className="w-full bg-[#FDB813] text-white font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                                    >
                                        <PlayCircle className="h-5 w-5" /> {proj.status === 'redo' ? "Resubmit Project" : "Submit Project"}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Completed & Feedback */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Completed & Feedback</h2>
                    </div>

                    <div className="space-y-4">
                        {completedProjects.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center">
                                <CheckCircle2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-bold text-gray-500">No graded projects yet.</p>
                            </div>
                        ) : (
                            completedProjects.map((proj, idx) => (
                                <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                    <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">{proj.title}</h3>
                                            <p className="text-sm text-gray-500">{proj.courseName}</p>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${proj.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-500'}`}>
                                                {proj.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-[#00B4D8] font-black text-2xl">
                                                {proj.score}<span className="text-sm text-gray-400 font-bold">/{proj.maxScore || 100}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Score</p>
                                        </div>
                                    </div>

                                    {proj.feedback && (
                                        <div className="bg-blue-50/50 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Star className="h-4 w-4 text-[#FDB813]" />
                                                <h4 className="font-bold text-sm text-gray-900">Instructor Feedback</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 italic">"{proj.feedback}"</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <ProjectSubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                assignment={selectedAssignment}
            />
        </div>
    );
}
