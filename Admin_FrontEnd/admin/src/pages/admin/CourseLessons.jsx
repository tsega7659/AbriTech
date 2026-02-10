import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Video, Image as ImageIcon, FileText, Link as LinkIcon,
    MoreHorizontal, Trash2, Edit, CheckCircle2, GripVertical, File
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { lessonService } from '../../services/lessonService';
import AddLessonModal from '../../components/AddLessonModal';
import Loading from '../../components/Loading';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import FeedbackModal from '../../components/FeedbackModal';

const CourseLessons = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { courses } = useAdmin();

    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);

    // Find course name
    const currentCourse = courses.find(c => String(c.id) === String(courseId));
    const courseName = currentCourse ? currentCourse.name : `ID: ${courseId}`;

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState(null);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    useEffect(() => {
        fetchLessons();
    }, [courseId]);

    const fetchLessons = async () => {
        setLoading(true);
        const result = await lessonService.getLessons(courseId);
        if (result.success) {
            // Backend returns ordered, but ensure sorting by orderNumber
            const sorted = result.data.sort((a, b) => a.orderNumber - b.orderNumber);
            setLessons(sorted);
        } else {
            showFeedback("Load Error", "Failed to load lessons for this course.", "error");
        }
        setLoading(false);
    };

    const handleAddClick = () => {
        setEditingLesson(null);
        setIsAddModalOpen(true);
    };

    const handleEditClick = (lesson) => {
        setEditingLesson(lesson);
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = (lesson) => {
        setLessonToDelete(lesson);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (lessonToDelete) {
            const result = await lessonService.deleteLesson(lessonToDelete.id);
            if (result.success) {
                setLessons(lessons.filter(l => l.id !== lessonToDelete.id));
                setIsDeleteModalOpen(false);
                setLessonToDelete(null);
                showFeedback("Success", "Lesson deleted successfully!", "success");
            } else {
                showFeedback("Operation Failed", result.message || "Failed to delete lesson", "error");
            }
        }
    };

    const handleSaveLesson = async (formData, onProgress) => {
        if (!formData.has('courseId')) {
            formData.append('courseId', courseId);
        }

        let result;
        if (editingLesson) {
            result = await lessonService.updateLesson(editingLesson.id, formData, onProgress);
        } else {
            result = await lessonService.createLesson(formData, onProgress);
        }

        if (result.success) {
            fetchLessons(); // Refresh list to get updated order and data
            setIsAddModalOpen(false);
            setEditingLesson(null);
            showFeedback("Success", `Lesson ${editingLesson ? 'updated' : 'created'} successfully!`, "success");
        } else {
            showFeedback("Operation Failed", result.message || "Failed to save lesson", "error");
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

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Lessons Management</h1>
                    <p className="text-slate-500 font-medium">Manage curriculum content for: <span className="text-primary font-black">{courseName}</span></p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" /> Add Lesson
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loading fullScreen={false} message="Loading Lessons..." />
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {lessons.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="font-bold text-slate-400">No lessons added yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {lessons.map((lesson) => (
                                <div key={lesson.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center gap-6 group">
                                    <div className="cursor-move text-slate-300 hover:text-slate-500">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div className="flex -space-x-2 shrink-0">
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
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">
                                                #{lesson.orderNumber}
                                            </span>
                                            <h3 className="font-black text-slate-800 truncate">{lesson.title}</h3>
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
                            ))}
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
                />
            )}

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Lesson"
                message="Are you sure you want to delete this lesson? This action cannot be undone."
                itemName={lessonToDelete?.title}
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
