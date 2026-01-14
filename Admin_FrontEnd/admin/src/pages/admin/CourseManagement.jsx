import React, { useState } from 'react';
import {
    Search,
    Plus,
    Users,
    MoreHorizontal,
    LayoutGrid,
    List,
    XCircle,
    BookOpen,
    FileText,
    Layers,
    Tag,
    DollarSign,
    Clock,
    Image as ImageIcon,
    Video,
    ArrowRight,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { API_BASE_URL } from '../../config/apiConfig';
import Loading from '../../components/Loading';

const CourseManagement = () => {
    const { courses, registerCourse, updateCourse, loading } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(null); // Stores the course ID being edited
    const [newCourse, setNewCourse] = useState({
        name: '',
        description: '',
        level: 'beginner',
        category: 'Web Development',
        duration: '',
        image: '',
        youtubeLink: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const categories = [
        'Web Development',
        'Mobile App Development',
        'Robotics',
        'AI & Machine Learning',
        'Data Science',
        'UI/UX Design',
        'STEM',
        'Other'
    ];

    const levels = ['beginner', 'intermediate', 'all levels'];

    const handleAddOrUpdateCourse = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const levelToSend = newCourse.level === 'all levels' ? 'advanced' : newCourse.level;

        // Prepare FormData
        const formData = new FormData();
        formData.append('name', newCourse.name);
        formData.append('category', newCourse.category);
        formData.append('level', levelToSend);

        // Merge duration into description if it's a new course or being updated
        // For simplicity, we just send description as is if it already contains duration
        formData.append('description', newCourse.description);

        if (newCourse.image) {
            formData.append('image', newCourse.image);
        }

        let result;
        if (isEditing) {
            result = await updateCourse(isEditing, formData);
        } else {
            result = await registerCourse(formData);
        }

        if (result.success) {
            setIsAdding(false);
            setIsEditing(null);
            setNewCourse({
                name: '',
                description: '',
                level: 'beginner',
                category: 'Web Development',
                duration: '',
                image: '',
                youtubeLink: ''
            });
        } else {
            alert(result.message || (isEditing ? 'Course update failed' : 'Course creation failed'));
        }
        setSubmitting(false);
    };

    const handleEditClick = (course) => {
        setIsEditing(course.id);
        setIsAdding(true);
        setNewCourse({
            name: course.name,
            description: course.description,
            level: course.level === 'advanced' ? 'all levels' : course.level,
            category: course.category || 'Web Development',
            duration: '', // Duration is merged in description in the database currently
            image: '', // Don't pre-fill the file input
            youtubeLink: course.youtubeLink || ''
        });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setIsEditing(null);
        setNewCourse({
            name: '',
            description: '',
            level: 'beginner',
            category: 'Web Development',
            duration: '',
            image: '',
            youtubeLink: ''
        });
    }

    const filteredCourses = courses.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 max-w-[1600px] mx-auto font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Courses</h1>
                    <p className="text-slate-500 font-bold">Manage all courses, curriculum, and enrollment data.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all w-full md:w-auto"
                    >
                        <Plus className="w-5 h-5" /> Add New Course
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-primary/20 shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <BookOpen className="w-7 h-7 text-primary" /> {isEditing ? 'Edit Course' : 'Create New Course'}
                        </h3>
                        <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-xl">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleAddOrUpdateCourse} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Course Name / Title</label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Master React and Node.js"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-black text-slate-700"
                                    value={newCourse.name}
                                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
                            <div className="relative group">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <select
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-black text-slate-700 appearance-none cursor-pointer"
                                    value={newCourse.category}
                                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description</label>
                            <textarea
                                required
                                rows="3"
                                placeholder="Write a compelling course description..."
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700 resize-none"
                                value={newCourse.description}
                                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Difficulty Level</label>
                            <div className="relative group">
                                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <select
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-black text-slate-700 appearance-none cursor-pointer"
                                    value={newCourse.level}
                                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                                >
                                    {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                </select>
                            </div>
                        </div>



                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Duration (e.g. 12 Weeks)</label>
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="8 Weeks"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-black text-slate-700"
                                    value={newCourse.duration}
                                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cover Image [max size: 5MB]</label>
                            <div className="relative group">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file && file.size > 5 * 1024 * 1024) {
                                            alert('File size exceeds 5MB limit');
                                            e.target.value = null;
                                            return;
                                        }
                                        setNewCourse({ ...newCourse, image: file });
                                    }}
                                />
                            </div>
                        </div>



                        <div className="lg:col-span-3 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-50">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all w-full sm:w-auto uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-12 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 w-full sm:w-auto uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> {isEditing ? 'Updating...' : 'Publishing...'}
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? 'Update Course' : 'Publish Course'}
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search Bar Area */}
            <div className="bg-white p-4 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search courses by title or category..."
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-bold text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button className="p-2.5 bg-white text-primary rounded-xl shadow-sm"><List className="w-5 h-5" /></button>
                    <button className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors"><LayoutGrid className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Course List/Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Information</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing & Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading.courses ? (
                                <tr>
                                    <td colSpan="4">
                                        <Loading fullScreen={false} message="Fetching Courses..." />
                                    </td>
                                </tr>
                            ) : filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <tr
                                        key={course.id}
                                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                        onClick={() => window.location.href = `/admin/courses/${course.id}/lessons`}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-20 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-sm ring-1 ring-slate-200/50">
                                                    {course.image ? (
                                                        <img
                                                            src={course.image.startsWith('http') ? course.image : `${API_BASE_URL.replace('/api', '')}${course.image}`}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <BookOpen className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors truncate pr-4">{course.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2.5 py-0.5 bg-primary/5 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                            {course.category}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">•</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {course.level === 'advanced' ? 'all levels' : course.level}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <span>{course.enrollments || 0} enrolled</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{course.duration || 'Flexible'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="text-sm font-black text-slate-800">
                                                    {course.price ? `$${course.price}` : 'Free'}
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest w-fit ring-1 ring-green-600/10">
                                                    <CheckCircle2 className="w-3 h-3" /> Live
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(course);
                                                }}
                                                className="p-3 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-2xl transition-all active:scale-90"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <BookOpen className="w-16 h-16 text-slate-100" />
                                            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No Courses Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer / Count */}
                <div className="p-6 bg-slate-50/30 border-t border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Total Published Courses: {courses.length}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CourseManagement;
