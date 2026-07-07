import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ClipboardList } from 'lucide-react';

const AddProjectModal = ({ isOpen, onClose, onSave, projectToEdit, courseId }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        orderNumber: '',
        dueDate: '',
        maxPoints: 100,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (projectToEdit && isOpen) {
            setFormData({
                title: projectToEdit.title || '',
                description: projectToEdit.description || '',
                orderNumber: projectToEdit.orderNumber || '',
                dueDate: projectToEdit.dueDate
                    ? new Date(projectToEdit.dueDate).toISOString().slice(0, 16)
                    : '',
                maxPoints: projectToEdit.maxPoints || 100,
            });
        } else if (isOpen) {
            setFormData({
                title: '',
                description: '',
                orderNumber: '',
                dueDate: '',
                maxPoints: 100,
            });
        }
    }, [projectToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.orderNumber) {
            alert('Title, description, and order number are required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                courseId,
                title: formData.title,
                description: formData.description,
                orderNumber: Number(formData.orderNumber),
                dueDate: formData.dueDate || null,
                maxPoints: Number(formData.maxPoints) || 100,
                requiresApproval: formData.requiresApproval,
            };
            await onSave(payload);
        } catch (error) {
            console.error('Save project error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">
                                {projectToEdit ? 'Edit Project/Assignment' : 'Add New Project'}
                            </h2>
                            <p className="text-slate-400 font-bold text-sm">
                                Students will submit work for instructor review
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    {/* Title & Order */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">
                                Project / Assignment Title
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g., Final Portfolio Project"
                                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">
                                Order Number
                            </label>
                            <input
                                required
                                type="number"
                                min="1"
                                placeholder="1"
                                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={formData.orderNumber}
                                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">
                            Description / Instructions
                        </label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Describe the project requirements, goals, and submission guidelines..."
                            className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Due Date & Max Points */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">
                                Due Date <span className="text-slate-300 normal-case font-medium">(optional)</span>
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">
                                Maximum Points
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                placeholder="100"
                                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={formData.maxPoints}
                                onChange={(e) => setFormData({ ...formData, maxPoints: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                        >
                            {isSubmitting ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 animate-pulse" /> Saving...
                                </>
                            ) : (
                                projectToEdit ? 'Update Project' : 'Create Project'
                            )}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default AddProjectModal;
