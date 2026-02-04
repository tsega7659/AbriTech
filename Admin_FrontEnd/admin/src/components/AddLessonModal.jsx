import React, { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, FileText, CheckCircle2, Video, Image as ImageIcon, Plus, Trash2, File, GripVertical } from 'lucide-react';

const AddLessonModal = ({ isOpen, onClose, onSave, lessonToEdit }) => {
    const [lessonData, setLessonData] = useState({
        title: '',
        description: '',
        orderNumber: '',
        resources: [
            { type: 'video', contentUrl: '', textContent: '', file: null, id: Date.now() }
        ]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (lessonToEdit && isOpen) {
            setLessonData({
                title: lessonToEdit.title,
                description: lessonToEdit.description,
                orderNumber: lessonToEdit.orderNumber,
                resources: lessonToEdit.resources && lessonToEdit.resources.length > 0
                    ? lessonToEdit.resources.map(r => ({ ...r, file: null }))
                    : [{ type: 'video', contentUrl: '', textContent: '', file: null, id: Date.now() }]
            });
        } else if (isOpen) {
            setLessonData({
                title: '',
                description: '',
                orderNumber: '',
                resources: [{ type: 'video', contentUrl: '', textContent: '', file: null, id: Date.now() }]
            });
        }
    }, [lessonToEdit, isOpen]);

    const handleAddResource = () => {
        setLessonData(prev => ({
            ...prev,
            resources: [...prev.resources, { type: 'video', contentUrl: '', textContent: '', file: null, id: `new-${Date.now()}-${Math.random()}` }]
        }));
    };

    const handleRemoveResource = (index) => {
        const newResources = lessonData.resources.filter((_, i) => i !== index);
        setLessonData({ ...lessonData, resources: newResources });
    };

    const handleResourceChange = (index, field, value) => {
        setLessonData(prev => {
            const newResources = [...prev.resources];
            newResources[index] = { ...newResources[index], [field]: value };
            return { ...prev, resources: newResources };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (lessonData.resources.length === 0) {
            alert("Please add at least one resource.");
            return;
        }
        setIsSubmitting(true);

        const data = new FormData();
        data.append('title', lessonData.title);
        data.append('description', lessonData.description);
        data.append('orderNumber', lessonData.orderNumber);

        // Prepare resources metadata (excluding files)
        const resourcesMetadata = lessonData.resources.map((res, index) => {
            const metadata = {
                type: res.type,
                contentUrl: res.contentUrl,
                textContent: res.textContent,
                orderNumber: index + 1
            };

            // If there's a file, we'll append it to FormData separately
            if (res.file) {
                data.append(`file_${index}`, res.file);
            }

            return metadata;
        });

        data.append('resources', JSON.stringify(resourcesMetadata));

        await onSave(data);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur z-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">
                            {lessonToEdit ? 'Edit Lesson' : 'Add New Lesson'}
                        </h2>
                        <p className="text-slate-400 font-bold text-sm">Create content for your students</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Lesson Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g., Introduction to React"
                                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={lessonData.title}
                                onChange={e => setLessonData({ ...lessonData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Order Number</label>
                            <input
                                required
                                type="number"
                                placeholder="1"
                                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={lessonData.orderNumber}
                                onChange={e => setLessonData({ ...lessonData, orderNumber: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Lesson Description</label>
                            <textarea
                                required
                                rows="2"
                                placeholder="Brief summary of the lesson..."
                                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                value={lessonData.description}
                                onChange={e => setLessonData({ ...lessonData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Resources Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Lesson Resources</h3>
                            <button
                                type="button"
                                onClick={handleAddResource}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-primary/10 text-primary rounded-xl font-black text-xs transition-all"
                            >
                                <Plus className="w-4 h-4" /> Add Resource
                            </button>
                        </div>

                        <div className="space-y-6">
                            {lessonData.resources.map((res, index) => (
                                <div key={res.id || index} className="relative group bg-slate-50/50 rounded-3xl border border-slate-100 p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-300">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-black text-slate-400">RESOURCE #{index + 1}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveResource(index)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">Type</label>
                                            <select
                                                className="w-full p-3 bg-white rounded-xl font-bold text-slate-700 outline-none border border-slate-100 focus:border-primary transition-all text-sm"
                                                value={res.type}
                                                onChange={e => handleResourceChange(index, 'type', e.target.value)}
                                            >
                                                <option value="video">Video</option>
                                                <option value="image">Image</option>
                                                <option value="text">Text / Article</option>
                                                <option value="link">External Link</option>
                                                <option value="file">File (PDF/Doc)</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-3">
                                            {res.type === 'link' ? (
                                                <>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">External URL</label>
                                                    <input
                                                        required
                                                        type="url"
                                                        placeholder="https://..."
                                                        className="w-full p-3 bg-white rounded-xl font-bold text-slate-700 outline-none border border-slate-100 focus:border-primary transition-all text-sm"
                                                        value={res.contentUrl}
                                                        onChange={e => handleResourceChange(index, 'contentUrl', e.target.value)}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">
                                                        {res.contentUrl && !res.file ? 'Current File' : `Upload ${res.type}`}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept={
                                                                res.type === 'video' ? 'video/*' :
                                                                    res.type === 'image' ? 'image/*' :
                                                                        '.pdf,.doc,.docx'
                                                            }
                                                            className="w-full p-2.5 bg-white rounded-xl border border-slate-100 text-xs font-bold text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary/5 file:text-primary file:font-black cursor-pointer"
                                                            onChange={e => handleResourceChange(index, 'file', e.target.files[0])}
                                                        />
                                                        {res.contentUrl && !res.file && (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-lg">
                                                                <CheckCircle2 className="w-3 h-3" /> ATTACHED
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="md:col-span-4">
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">Text content / description for this resource</label>
                                            <textarea
                                                rows="3"
                                                placeholder="Add some context or text for this specific resource..."
                                                className="w-full p-3 bg-white rounded-xl font-medium text-slate-700 outline-none border border-slate-100 focus:border-primary transition-all text-sm resize-y"
                                                value={res.textContent}
                                                onChange={e => handleResourceChange(index, 'textContent', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white/90 backdrop-blur pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                        >
                            {isSubmitting ? 'Saving...' : (lessonToEdit ? 'Update Lesson' : 'Create Lesson')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLessonModal;
