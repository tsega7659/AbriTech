import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, ClipboardList, Trash2, Edit, Calendar,
    Award, ToggleLeft, ToggleRight, Clock
} from 'lucide-react';
import {
    useAdminCourses,
    useAssignments,
    useCreateAssignment,
    useUpdateAssignment,
    useDeleteAssignment
} from '../../hooks/useAdminQueries';
import AddProjectModal from '../../components/AddProjectModal';
import Loading from '../../components/Loading';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import FeedbackModal from '../../components/FeedbackModal';

const CourseProjects = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const { data: courses = [] } = useAdminCourses();
    const { data: assignments = [], isLoading: assignmentsLoading } = useAssignments(courseId);
    const createMutation = useCreateAssignment();
    const updateMutation = useUpdateAssignment();
    const deleteMutation = useDeleteAssignment();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const currentCourse = courses.find(c => String(c.id) === String(courseId));
    const courseName = currentCourse ? currentCourse.name : `Course #${courseId}`;

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const handleAddClick = () => {
        setEditingProject(null);
        setIsAddModalOpen(true);
    };

    const handleEditClick = (project) => {
        setEditingProject(project);
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        setIsDeleting(true);
        try {
            await deleteMutation.mutateAsync({ id: projectToDelete.id, courseId });
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
            showFeedback('Success', 'Project deleted successfully!', 'success');
        } catch (error) {
            showFeedback('Operation Failed', error.response?.data?.message || 'Failed to delete project', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaveProject = async (payload) => {
        if (editingProject) {
            try {
                await updateMutation.mutateAsync({
                    id: editingProject.id,
                    data: payload
                });
                setIsAddModalOpen(false);
                setEditingProject(null);
                showFeedback('Success', 'Project updated successfully!', 'success');
            } catch (error) {
                showFeedback('Operation Failed', error.response?.data?.message || 'Failed to update project', 'error');
                throw error;
            }
        } else {
            try {
                await createMutation.mutateAsync(payload);
                setIsAddModalOpen(false);
                showFeedback('Success', 'Project created successfully!', 'success');
            } catch (error) {
                showFeedback('Operation Failed', error.response?.data?.message || 'Failed to create project', 'error');
                throw error;
            }
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
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
                    <h1 className="text-3xl font-black text-slate-800">Projects & Assignments</h1>
                    <p className="text-slate-500 font-medium">
                        Manage work assignments for:{' '}
                        <span className="text-primary font-black">{courseName}</span>
                    </p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" /> Add Project
                </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Projects', value: assignments.length, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'With Deadline', value: assignments.filter(a => a.dueDate).length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Requires Review', value: assignments.filter(a => a.requiresApproval).length, icon: Award, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { label: 'Total Max Points', value: assignments.reduce((sum, a) => sum + (Number(a.maxPoints) || 0), 0), icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white px-5 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {assignmentsLoading ? (
                <div className="flex justify-center py-20">
                    <Loading fullScreen={false} message="Loading Projects..." />
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {assignments.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                <ClipboardList className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="font-bold text-slate-400">No projects added yet.</p>
                            <p className="text-sm text-slate-300 font-medium">
                                Create the first assignment for students to submit work.
                            </p>
                            <button
                                onClick={handleAddClick}
                                className="mt-2 flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all"
                            >
                                <Plus className="w-4 h-4" /> Add First Project
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {assignments.map((project) => (
                                <div
                                    key={project.id}
                                    className="p-6 hover:bg-slate-50 transition-colors flex items-center gap-6 group"
                                >
                                    {/* Order Badge */}
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                        <span className="text-xs font-black text-primary">#{project.orderNumber}</span>
                                    </div>

                                    {/* Project Icon */}
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                        <ClipboardList className="w-5 h-5 text-slate-500" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="font-black text-slate-800 truncate">{project.title}</h3>
                                            {project.requiresApproval && (
                                                <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-violet-100">
                                                    Needs Review
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium truncate mt-1">
                                            {project.description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                                <Award className="w-3 h-3" /> {project.maxPoints} pts
                                            </span>
                                            {project.dueDate && (
                                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Due {formatDate(project.dueDate)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditClick(project)}
                                            className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-xl transition-colors"
                                            title="Edit Project"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(project)}
                                            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
                                            title="Delete Project"
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
                <AddProjectModal
                    isOpen={isAddModalOpen}
                    onClose={() => { setIsAddModalOpen(false); setEditingProject(null); }}
                    onSave={handleSaveProject}
                    projectToEdit={editingProject}
                    courseId={courseId}
                />
            )}

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Project"
                message="Are you sure you want to delete this project/assignment? All student submissions will also be deleted."
                itemName={projectToDelete?.title}
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

export default CourseProjects;
