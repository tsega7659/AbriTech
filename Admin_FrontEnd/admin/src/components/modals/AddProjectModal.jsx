import React, { useState } from 'react';
import { X, Calendar, FileText, Send, CheckCircle2 } from 'lucide-react';
import { useInstructor } from '../../context/InstructorContext';
import Loading from '../Loading';

const AddProjectModal = ({ isOpen, onClose, courseId }) => {
    const { addCourseProject, refreshInstructorData } = useInstructor();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        requiresApproval: true
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const success = await addCourseProject(courseId, formData);

        if (success) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
                refreshInstructorData();
            }, 2000);
        } else {
            setSubmitting(false);
            alert("Failed to add project. Please try again.");
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div className="bg-white rounded-[2rem] p-12 text-center space-y-4 max-w-sm w-full animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Project Added!</h2>
                    <p className="text-slate-500 font-medium text-sm">The project has been assigned to all students in this course.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl shadow-slate-900/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Add Course Project</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Assigned to all course students</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Project Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Project Title</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Final E-commerce UI Design"
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Requirements & Instructions</label>
                        <textarea
                            required
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe what students need to do for this project..."
                            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all text-sm font-medium resize-none"
                        ></textarea>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Submission Deadline</label>
                        <div className="relative">
                            <input
                                required
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={submitting}
                            type="submit"
                            className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loading size="small" fullScreen={false} message="Assigning..." />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Assign Project
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectModal;
