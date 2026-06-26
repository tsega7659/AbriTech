import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Loader2,
    ClipboardList
} from 'lucide-react';
import {
    useAdminCourses,
    useTeachers,
    useCreateCourse,
    useUpdateCourse,
    useDeleteCourse
} from '../../hooks/useAdminQueries';
import { API_BASE_URL } from '../../config/apiConfig';
import Loading from '../../components/Loading';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import FeedbackModal from '../../components/FeedbackModal';

const CourseManagement = () => {
    const navigate = useNavigate();
    const { data: courses = [], isLoading: coursesLoading } = useAdminCourses();
    const { data: teachers = [] } = useTeachers();

    // Mutations
    const createCourseMutation = useCreateCourse();
    const updateCourseMutation = useUpdateCourse();
    const deleteCourseMutation = useDeleteCourse();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [newCourse, setNewCourse] = useState({
        name: '',
        description: '',
        level: 'beginner',
        category: 'Web Development',
        duration: '',
        image: '',
        youtubeLink: '',
        price: '',
        isFree: true,
        hasDiscount: false,
        discountPrice: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [customCategory, setCustomCategory] = useState('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const handleDeleteClick = (course) => {
        setCourseToDelete(course);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!courseToDelete) return;

        setIsDeleting(true);
        try {
            await deleteCourseMutation.mutateAsync(courseToDelete.id);
            setIsDeleteModalOpen(false);
            setCourseToDelete(null);
        } catch (error) {
            showFeedback("Operation Failed", error.response?.data?.message || "Failed to delete course", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const categories = [
        'STEM',
        'Programming',
        'Robotics',
        'Web Development',
        'AI & Machine Learning',
        '3D Design',
        'Mobile App Development',
        'UI/UX Design',
        'other',
    ];

    const levels = ['beginner', 'intermediate', 'advanced', 'all levels'];

    const handleAddOrUpdateCourse = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setUploadProgress(0);

        const levelToSend = newCourse.level === 'all levels' ? 'advanced' : newCourse.level;
        const categoryToSend = newCourse.category === 'other' ? customCategory : newCourse.category;

        const formData = new FormData();
        formData.append('name', newCourse.name);
        formData.append('category', categoryToSend);
        formData.append('level', levelToSend);
        formData.append('description', newCourse.description);
        formData.append('duration', newCourse.duration);
        formData.append('price', newCourse.price || 0);
        formData.append('isFree', newCourse.isFree);
        formData.append('hasDiscount', newCourse.hasDiscount);
        formData.append('discountPrice', newCourse.discountPrice || 0);


        if (newCourse.image) {
            formData.append('image', newCourse.image);
        }

        const mutationToUse = isEditing ? updateCourseMutation : createCourseMutation;
        const mutationParams = isEditing
            ? { id: isEditing, formData, onProgress: (p) => setUploadProgress(p) }
            : { formData, onProgress: (p) => setUploadProgress(p) };
        try {
            await mutationToUse.mutateAsync(mutationParams, {
                onSuccess: () => {
                    setIsAdding(false);
                    setIsEditing(null);
                    setNewCourse({
                        name: '',
                        description: '',
                        level: 'beginner',
                        category: 'STEM',
                        duration: '',
                        image: '',
                        youtubeLink: '',
                        price: '',
                        isFree: true,
                        hasDiscount: false,
                        discountPrice: '',
                    });
                    setCustomCategory('');
                    showFeedback("Success", `Course ${isEditing ? 'updated' : 'published'} successfully!`, "success");
                },
                onError: (error) => {
                    showFeedback("Operation Failed", error.response?.data?.message || (isEditing ? 'Course update failed' : 'Course creation failed'), "error");
                }
            });
        } catch (error) {
            console.error('Mutation error:', error);
        } finally {
            setSubmitting(false);
            setUploadProgress(0);
        }
    };

    const handleEditClick = (course) => {
        setIsEditing(course.id);
        setIsAdding(true);
        setNewCourse({
            name: course.name,
            description: course.description,
            level: course.level === 'advanced' ? 'all levels' : course.level,
            category: course.category || 'STEM',
            duration: course.duration || '',
            image: '', // Don't pre-fill the file input
            youtubeLink: course.youtubeLink || '',
            price: course.price || '',
            isFree: course.isFree !== undefined ? course.isFree : true,
            hasDiscount: course.hasDiscount || false,
            discountPrice: course.discountPrice || '',
        });

        if (!categories.includes(course.category)) {
            setNewCourse(prev => ({ ...prev, category: 'other' }));
            setCustomCategory(course.category);
        } else {
            setCustomCategory('');
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setIsEditing(null);
        setNewCourse({
            name: '',
            description: '',
            level: 'beginner',
            category: 'STEM',
            duration: '',
            image: '',
            youtubeLink: '',
            price: '',
            isFree: true,
            hasDiscount: false,
            discountPrice: '',
        });
        setCustomCategory('');
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
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <BookOpen className="w-7 h-7 text-primary" /> {isEditing ? 'Edit Course' : 'Create New Course'}
                            </h3>
                            {submitting && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 max-w-md">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                            {uploadProgress < 100 ? 'Uploading course assets...' : 'Finalizing course...'}
                                        </span>
                                        <span className="text-[10px] font-black text-primary">{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-[#00CED1] transition-all duration-300 ease-out"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={handleCancel} disabled={submitting} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-xl disabled:opacity-50">
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
                                    onChange={(e) => {
                                        setNewCourse({ ...newCourse, category: e.target.value });
                                        if (e.target.value !== 'other') setCustomCategory('');
                                    }}
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            {newCourse.category === 'other' && (
                                <div className="mt-3 relative group animate-in fade-in slide-in-from-top-2 duration-300">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Type custom category name..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700 text-sm"
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                    />
                                </div>
                            )}
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

                        {/* Pricing Section */}
                        <div className="space-y-4 lg:col-span-3 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 mt-4">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <DollarSign className="w-4 h-4 text-primary" /> Pricing & Access Control
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pricing Type</label>
                                    <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-slate-100 w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setNewCourse({ ...newCourse, isFree: true, price: '' })}
                                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newCourse.isFree ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Free
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewCourse({ ...newCourse, isFree: false })}
                                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!newCourse.isFree ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Paid
                                        </button>
                                    </div>
                                </div>

                                {!newCourse.isFree && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Base Price (ETB)</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">ETB</div>
                                            <input
                                                type="number"
                                                required={!newCourse.isFree}
                                                placeholder="1499"
                                                className="w-full pl-14 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:border-primary focus:outline-none transition-all font-black text-slate-700"
                                                value={newCourse.price}
                                                onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!newCourse.isFree && (
                                    <div className="flex flex-col justify-end space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
                                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                            <div
                                                onClick={() => setNewCourse({ ...newCourse, hasDiscount: !newCourse.hasDiscount })}
                                                className={`w-10 h-6 rounded-full transition-all relative ${newCourse.hasDiscount ? 'bg-green-500' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newCourse.hasDiscount ? 'left-5' : 'left-1'}`} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">Apply Discount</span>
                                        </label>
                                    </div>
                                )}

                                {newCourse.hasDiscount && !newCourse.isFree && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Discount Price (ETB)</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">ETB</div>
                                            <input
                                                type="number"
                                                required={newCourse.hasDiscount}
                                                placeholder="999"
                                                className="w-full pl-14 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:border-primary focus:outline-none transition-all font-black text-slate-700"
                                                value={newCourse.discountPrice}
                                                onChange={(e) => setNewCourse({ ...newCourse, discountPrice: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}


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
                                            showFeedback("File Too Large", "Maximum image size is 5MB. Please choose a smaller file.", "warning");
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
                                onClick={handleCancel}
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
                            {coursesLoading ? (
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
                                        onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
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
                                                    <span>{course.enrolledStudents || 0} enrolled</span>
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
                                                    {course.isFree ? (
                                                        <span className="text-green-600">Free</span>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            {course.hasDiscount ? (
                                                                <>
                                                                    <span className="text-slate-400 line-through text-[10px]">{course.price} ETB</span>
                                                                    <span className="text-primary">{course.discountPrice} ETB</span>
                                                                </>
                                                            ) : (
                                                                <span>{course.price} ETB</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest w-fit ring-1 ring-green-600/10">
                                                        <CheckCircle2 className="w-3 h-3" /> Live
                                                    </span>

                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/courses/${course.id}/projects`);
                                                    }}
                                                    className="px-4 py-2 text-violet-500 hover:bg-violet-50 rounded-xl transition-all font-bold text-sm flex items-center gap-1.5"
                                                    title="Manage Projects"
                                                >
                                                    <ClipboardList className="w-4 h-4" /> Projects
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(course);
                                                    }}
                                                    className="px-4 py-2 text-primary hover:bg-primary/10 rounded-xl transition-all font-bold text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(course);
                                                    }}
                                                    className="px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-bold text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
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
            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Course"
                message="Are you sure you want to delete this course? This action cannot be undone and will remove all student enrollments for this course."
                itemName={courseToDelete?.name}
                loading={isDeleting}
            />
            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
            />
        </div >
    );
};

export default CourseManagement;
