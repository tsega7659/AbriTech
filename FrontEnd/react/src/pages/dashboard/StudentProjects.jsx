import React, { useState } from "react";
import { FolderGit2, CheckCircle2, Clock, PlayCircle, Star, Github } from "lucide-react";
import { useStudentDashboard } from "../../hooks/useStudentQueries";
import Loading from "../../components/Loading";

export default function StudentProjects() {
    const { data: dashboardData, isLoading } = useStudentDashboard();
    
    // For a full implementation, we would query the `/projects` or `/assignments` endpoint directly.
    // For now, we will use pendingProjects from dashboard data + a placeholder for completed ones.

    if (isLoading) {
        return <Loading fullScreen={false} message="Loading your projects..." />;
    }

    const pendingProjects = dashboardData?.pendingProjects || [];

    const completedProjects = [
        {
            id: 101,
            title: "Robotics Kinematics Engine",
            courseName: "Advanced Robotics",
            score: 95,
            feedback: "Excellent work on the inverse kinematics calculations. Your code is very well organized. Consider adding more unit tests for the edge cases.",
            submittedDate: "2026-03-15",
            githubLink: "https://github.com/student/robotics-engine"
        }
    ];

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
                                <div key={proj.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">{proj.title}</h3>
                                            <p className="text-sm text-[#00B4D8] font-bold">{proj.courseName}</p>
                                        </div>
                                        <span className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Due {new Date(proj.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-6 line-clamp-2">Complete the required implementation and submit your source code along with a demonstration video.</p>
                                    <button className="w-full bg-[#FDB813] text-white font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                                        <PlayCircle className="h-5 w-5" /> Submit Project
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
                        {completedProjects.map(proj => (
                            <div key={proj.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">{proj.title}</h3>
                                        <p className="text-sm text-gray-500">{proj.courseName}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-green-500 font-black text-2xl">
                                            {proj.score} <span className="text-sm text-gray-400 font-bold">/100</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Score</p>
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50/50 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="h-4 w-4 text-[#FDB813]" />
                                        <h4 className="font-bold text-sm text-gray-900">Instructor Feedback</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 italic">"{proj.feedback}"</p>
                                </div>

                                {proj.githubLink && (
                                    <div className="mt-4 flex">
                                        <a href={proj.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 px-4 py-2 rounded-xl">
                                            <Github className="h-4 w-4" /> View Repository
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
