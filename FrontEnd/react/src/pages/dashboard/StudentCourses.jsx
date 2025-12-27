import { Search, Filter, BookOpen, Clock, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudentCourses() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                    <p className="text-gray-600 mt-1">Manage and access your enrolled courses</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none text-sm w-full sm:w-64"
                        />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                        <Filter className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { id: 1, title: "Introduction to Python", progress: 65, totalLessons: 24, completedLessons: 16, img: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=600", tag: "Coding" },
                    { id: 2, title: "Robotics Basics", progress: 30, totalLessons: 12, completedLessons: 4, img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600", tag: "Robotics" },
                    { id: 3, title: "Web Development", progress: 10, totalLessons: 40, completedLessons: 4, img: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=600", tag: "React" }
                ].map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                        <div className="h-48 relative overflow-hidden">
                            <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded-lg text-xs font-bold text-gray-900">
                                {course.tag}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900 text-lg leading-tight">{course.title}</h3>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.completedLessons}/{course.totalLessons} Lessons</span>
                                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 12h Left</span>
                            </div>

                            <div className="mt-auto">
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="text-gray-700">Progress</span>
                                    <span className="text-[#00B4D8]">{course.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-[#00B4D8] rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                                </div>
                                <Link
                                    to={`/dashboard/student/courses/${course.id}`}
                                    className="block w-full text-center bg-[#00B4D8] text-white font-bold py-2.5 rounded-xl hover:bg-[#0096B4] transition-colors"
                                >
                                    Continue Learning
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
