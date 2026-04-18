import React, { useRef } from "react";
import { Award, FolderGit2, Printer, Share2, Github, Linkedin, Globe, MapPin, Calendar, BookOpen } from "lucide-react";
import { useStudentPortfolio } from "../../hooks/useStudentQueries";
import Loading from "../../components/Loading";

export default function StudentPortfolio() {
    const { data: portfolioData, isLoading } = useStudentPortfolio();
    const printRef = useRef();

    if (isLoading) {
        return <Loading fullScreen={false} message="Loading your portfolio..." />;
    }

    const handlePrint = () => {
        window.print();
    };

    const profile = portfolioData?.profile || {};
    const projects = portfolioData?.projects || [];
    const completedCourses = portfolioData?.completedCourses || [];

    // Fallbacks for missing backend data
    const age = profile.age || "15";
    const bio = profile.bio || "Enthusiastic robotics and coding student with a passion for building interactive hardware projects.";
    const socialLinks = profile.socialLinks || { github: "github.com", linkedin: "", website: "" };
    const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://abritech.onrender.com';

    return (
        <div className="space-y-8 print:space-y-4">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Portfolio</h1>
                    <p className="text-gray-600 mt-1">Your public profile showcasing your achievements.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                        <Share2 className="h-4 w-4" /> Publish
                    </button>
                    <button onClick={handlePrint} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#FDB813] text-white px-4 py-2.5 rounded-xl font-bold hover:bg-yellow-500 transition-colors">
                        <Printer className="h-4 w-4" /> Export PDF
                    </button>
                </div>
            </header>

            <div ref={printRef} className="print:block bg-gray-50 print:bg-white rounded-[2rem] print:rounded-none overflow-hidden border border-gray-100 print:border-none shadow-sm print:shadow-none min-h-[800px]">
                {/* Portfolio Header / Profile Section */}
                <div className="bg-white p-8 sm:p-12 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 relative">
                            <img 
                                src={profile.profileImage ? `${API_BASE_URL}${profile.profileImage}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                                alt={profile.fullName} 
                                className="w-full h-full rounded-2xl object-cover border-4 border-white shadow-lg print:border-none print:shadow-none"
                            />
                            <div className="absolute -bottom-3 -right-3 bg-[#00B4D8] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
                                <Award className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{profile.fullName}</h1>
                                <span className="bg-blue-50 text-[#00B4D8] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{profile.educationLevel}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500 mb-6">
                                <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Age: {age}</div>
                                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.classLevel}</div>
                                <div className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-[#FDB813]" /> {completedCourses.length} Courses Completed</div>
                            </div>

                            <p className="text-gray-600 max-w-3xl leading-relaxed">{bio}</p>

                            <div className="flex gap-4 mt-6 print:hidden">
                                {socialLinks.github && (
                                    <a href={`https://${socialLinks.github}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                                        <Github className="h-5 w-5" />
                                    </a>
                                )}
                                {socialLinks.linkedin && (
                                    <a href={`https://${socialLinks.linkedin}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                                        <Linkedin className="h-5 w-5" />
                                    </a>
                                )}
                                {socialLinks.website && (
                                    <a href={`https://${socialLinks.website}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                                        <Globe className="h-5 w-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 sm:p-12 space-y-12">
                    {/* Projects Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <FolderGit2 className="h-6 w-6 text-[#00B4D8]" />
                            <h2 className="text-2xl font-black text-gray-900 border-b-2 border-gray-100 pb-2 flex-grow">Featured Projects</h2>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
                            {projects.length === 0 ? (
                                <p className="text-gray-500 italic md:col-span-2">No projects published yet.</p>
                            ) : (
                                projects.map((proj, idx) => (
                                    <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm print:border-none print:p-4 print:shadow-none print:break-inside-avoid">
                                        {proj.imageUrl && (
                                            <div className="h-40 w-full rounded-2xl overflow-hidden mb-4 bg-gray-100">
                                                <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{proj.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 print:line-clamp-none">{proj.description}</p>
                                        <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                                            <span className="text-xs font-bold text-gray-400 uppercase">{new Date(proj.submittedAt).toLocaleDateString()}</span>
                                            {proj.githubLink && (
                                                <span className="text-[#00B4D8] text-sm font-bold flex items-center gap-1">
                                                    View Source <Github className="h-4 w-4" />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Certifications & Courses */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <Award className="h-6 w-6 text-[#FDB813]" />
                            <h2 className="text-2xl font-black text-gray-900 border-b-2 border-gray-100 pb-2 flex-grow">Certifications & Completed Courses</h2>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
                            {completedCourses.length === 0 ? (
                                <p className="text-gray-500 italic sm:col-span-2 lg:col-span-3">Enrolled in courses, working towards certificates.</p>
                            ) : (
                                completedCourses.map((course, idx) => (
                                    <div key={idx} className="bg-white flex items-center gap-4 p-4 rounded-2xl border border-gray-100 print:border-gray-300">
                                        <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
                                            <Award className="h-6 w-6 text-[#FDB813]" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 leading-tight">{course.name}</h4>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">{course.category}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
            
            {/* Styles for printing */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:block, .print\\:block * {
                        visibility: visible;
                    }
                    .print\\:block {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
