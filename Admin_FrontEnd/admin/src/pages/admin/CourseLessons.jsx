import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Video, Image as ImageIcon, FileText, Link as LinkIcon,
    MoreHorizontal, Trash2, Edit, CheckCircle2, GripVertical, File, Lock, Sparkles, ClipboardList, ChevronDown
} from 'lucide-react';
import {
    useAdminCourses,
    useLessons,
    useCreateLesson,
    useUpdateLesson,
    useDeleteLesson,
    useCreateAssignment,
    useUpdateAssignment,
    useDeleteAssignment
} from '../../hooks/useAdminQueries';
import AddLessonModal from '../../components/AddLessonModal';
import AddProjectModal from '../../components/AddProjectModal';
import Loading from '../../components/Loading';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import FeedbackModal from '../../components/FeedbackModal';

const CourseLessons = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Hooks
    const { data: courses = [] } = useAdminCourses();
    const { data: lessons = [], isLoading: lessonsLoading } = useLessons(courseId);

    // Lesson Mutations
    const createLessonMutation = useCreateLesson();
    const updateLessonMutation = useUpdateLesson();
    const deleteLessonMutation = useDeleteLesson();

    // Project Mutations
    const createProjectMutation = useCreateAssignment();
    const updateProjectMutation = useUpdateAssignment();
    const deleteProjectMutation = useDeleteAssignment();

    const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [lessonInitialType, setLessonInitialType] = useState('lesson');

    // Project Modal State
    const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // Find course name
    const currentCourse = courses.find(c => String(c.id) === String(courseId));
    const courseName = currentCourse ? currentCourse.name : `ID: ${courseId}`;

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const handleAddClick = (type = 'lesson') => {
        setLessonInitialType(type);
        setEditingLesson(null);
        setIsAddModalOpen(true);
        setIsAddDropdownOpen(false);
    };

    const handleAddProjectClick = () => {
        setEditingProject(null);
        setIsAddProjectModalOpen(true);
        setIsAddDropdownOpen(false);
    };

    const handleEditClick = (item) => {
        if (item.contentType === 'project') {
            setEditingProject(item);
            setIsAddProjectModalOpen(true);
        } else {
            setEditingLesson(item);
            setIsAddModalOpen(true);
        }
    };

    const handleDeleteClick = (item) => {
        setLessonToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!lessonToDelete) return;

        setIsDeleting(true);
        try {
            if (lessonToDelete.contentType === 'project') {
                await deleteProjectMutation.mutateAsync({ id: lessonToDelete.id, courseId });
                showFeedback("Success", "Project deleted successfully!", "success");
            } else {
                await deleteLessonMutation.mutateAsync({ id: lessonToDelete.id, courseId });
                showFeedback("Success", "Lesson deleted successfully!", "success");
            }
            setIsDeleteModalOpen(false);
            setLessonToDelete(null);
        } catch (error) {
            showFeedback("Operation Failed", error.response?.data?.message || "Failed to delete item", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaveLesson = async (formData, onProgress) => {
        if (!formData.has('courseId')) {
            formData.append('courseId', courseId);
        }

        const mutationToUse = editingLesson ? updateLessonMutation : createLessonMutation;
        const mutationParams = editingLesson
            ? { id: editingLesson.id, formData, onProgress }
            : { formData, onProgress };

        try {
            await mutationToUse.mutateAsync(mutationParams, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    setEditingLesson(null);
                    showFeedback("Success", `Lesson ${editingLesson ? 'updated' : 'created'} successfully!`, "success");
                },
                onError: (error) => {
                    showFeedback("Operation Failed", error.response?.data?.message || "Failed to save lesson", "error");
                }
            });
        } catch (error) {
            console.error('Mutation error:', error);
        }
    };

    const handleSaveProject = async (payload) => {
        const mutationToUse = editingProject ? updateProjectMutation : createProjectMutation;
        const mutationParams = editingProject
            ? { id: editingProject.id, data: payload }
            : payload;

        try {
            await mutationToUse.mutateAsync(mutationParams, {
                onSuccess: () => {
                    setIsAddProjectModalOpen(false);
                    setEditingProject(null);
                    showFeedback("Success", `Project ${editingProject ? 'updated' : 'created'} successfully!`, "success");
                    // Invalidate the unified lessons list so projects appear inline
                    queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', courseId] });
                },
                onError: (error) => {
                    showFeedback("Operation Failed", error.response?.data?.message || "Failed to save project", "error");
                }
            });
        } catch (error) {
            console.error('Project Mutation error:', error);
        }
    };

    const getTypeIcon = (type, size = "w-5 h-5") => {
        switch (type) {
            case 'video': return <Video className={`${size} text-blue-500`} />;
            case 'image': return <ImageIcon className={`${size} text-purple-500`} />;
            case 'text': return <FileText className={`${size} text-green-500`} />;
            case 'link': return <LinkIcon className={`${size} text-orange-500`} />;
            default: return <File className={`${size} text-gray-500`} />;
        }
    };

    return (
        <div className="p-4 md:p-10 max-w-[1200px] mx-auto space-y-8 font-sans">
            <button
                onClick={() => navigate(-1)}
                className="text-slate-500 hover:text-primary flex items-center gap-2 font-bold transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Courses
            </button>

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Curriculum Management</h1>
                    <p className="text-slate-500 font-medium">Manage lessons, quizzes, and projects for: <span className="text-primary font-black">{courseName}</span></p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg hover:shadow-xl active:scale-95 transition-all text-sm"
                    >
                        <Plus className="w-5 h-5" /> Add Content <ChevronDown className={`w-4 h-4 transition-transform ${isAddDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAddDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsAddDropdownOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-20 py-2 animate-in fade-in slide-in-from-top-2">
                                <button
                                    onClick={() => handleAddClick('lesson')}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Video className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm">Lesson</div>
                                        <div className="text-[10px] text-slate-400 font-medium">Video, Text, Files</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleAddClick('quiz')}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm">Independent Quiz</div>
                                        <div className="text-[10px] text-slate-400 font-medium">Multiple choice</div>
                                    </div>
                                </button>
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                    onClick={handleAddProjectClick}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <File className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm">Project</div>
                                        <div className="text-[10px] text-slate-400 font-medium">Assignment submission</div>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {lessonsLoading ? (
                <div className="flex justify-center py-20">
                    <Loading fullScreen={false} message="Loading Curriculum..." />
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {lessons.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="font-bold text-slate-400">No lessons or projects added yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {lessons.map((lesson) => {
                                const isProject = lesson.contentType === 'project';
                                return (
                                    <div key={`${lesson.contentType || 'lesson'}-${lesson.id}`} className="p-6 hover:bg-slate-50 transition-colors flex items-center gap-6 group">
                                        <div className="cursor-move text-slate-300 hover:text-slate-500">
                                            <GripVertical className="w-5 h-5" />
                                        </div>

                                        <div className="flex -space-x-2 shrink-0">
                                            {isProject ? (
                                                <div className="w-10 h-10 bg-amber-50 border-2 border-amber-100 rounded-xl flex items-center justify-center shadow-sm">
                                                    <ClipboardList className="w-5 h-5 text-amber-500" />
                                                </div>
                                            ) : (
                                                <>
                                                    {lesson.resources && lesson.resources.slice(0, 4).map((res, i) => (
                                                        <div key={i} className="w-10 h-10 bg-white border-2 border-slate-50 rounded-xl flex items-center justify-center shadow-sm" title={res.type}>
                                                            {getTypeIcon(res.type, "w-4 h-4")}
                                                        </div>
                                                    ))}
                                                    {lesson.resources && lesson.resources.length > 4 && (
                                                        <div className="w-10 h-10 bg-slate-100 border-2 border-slate-50 rounded-xl flex items-center justify-center shadow-sm text-[10px] font-black text-slate-400">
                                                            +{lesson.resources.length - 4}
                                                        </div>
                                                    )}
                                                    {(!lesson.resources || lesson.resources.length === 0) && (
                                                        <div className="w-10 h-10 bg-slate-50 border-2 border-slate-50 rounded-xl flex items-center justify-center text-slate-200">
                                                            <File className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${isProject ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    #{lesson.orderNumber}
                                                </span>
                                                <h3 className="font-black text-slate-800 truncate">
                                                    {isProject ? `[Project] ${lesson.title}` : lesson.title}
                                                </h3>
                                                {isProject && (
                                                    <span className="text-[9px] font-black bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-widest px-2 py-0.5 rounded-full">
                                                        Points: {lesson.maxPoints || lesson.maxScore || 100}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400 font-medium truncate mt-1">
                                                {lesson.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditClick(lesson)}
                                                className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-xl transition-colors"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(lesson)}
                                                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {isAddModalOpen && (
                <AddLessonModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveLesson}
                    lessonToEdit={editingLesson}
                    initialContentType={lessonInitialType}
                />
            )}

            {isAddProjectModalOpen && (
                <AddProjectModal
                    isOpen={isAddProjectModalOpen}
                    onClose={() => setIsAddProjectModalOpen(false)}
                    onSave={handleSaveProject}
                    projectToEdit={editingProject}
                    courseId={courseId}
                />
            )}

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={lessonToDelete?.contentType === 'project' ? "Delete Project" : "Delete Lesson"}
                message={`Are you sure you want to delete this ${lessonToDelete?.contentType === 'project' ? 'project' : 'lesson'}? This action cannot be undone.`}
                itemName={lessonToDelete?.title}
                loading={isDeleting}
            />
            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
            />
        </div>
    );
};

export default CourseLessons;
