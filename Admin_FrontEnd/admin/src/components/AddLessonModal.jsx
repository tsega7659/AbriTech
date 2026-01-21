import React, { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, FileText, CheckCircle2, Video, Image as ImageIcon } from 'lucide-react';

const AddLessonModal = ({ isOpen, onClose, onSave, lessonToEdit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        orderNumber: '',
        type: 'video', // Default
        contentUrl: '',
        textContent: '',
    });
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (lessonToEdit) {
            setFormData({
                title: lessonToEdit.title,
                description: lessonToEdit.description,
                orderNumber: lessonToEdit.orderNumber,
                type: lessonToEdit.type,
                contentUrl: lessonToEdit.type === 'link' ? lessonToEdit.contentUrl : '',
                textContent: lessonToEdit.textContent || ''
            });
            // Note: We can't pre-fill file inputs
        } else {
            setFormData({
                title: '',
                description: '',
                orderNumber: '', // Ideally, auto-increment based on list length + 1
                type: 'video',
                contentUrl: '',
                textContent: ''
            });
            setFile(null);
        }
    }, [lessonToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('orderNumber', formData.orderNumber);
        data.append('type', formData.type);

        if (formData.type === 'link') {
            data.append('contentUrl', formData.contentUrl);
        } else if (formData.type === 'text') {
            data.append('textContent', formData.textContent);
        } else if (file) {
            data.append('file', file);
        }

        await onSave(data);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur z-10">
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
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Lesson Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g., Introduction to React"
                                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Description</label>
                            <textarea
                                required
                                rows="3"
                                placeholder="Brief summary of the lesson..."
                                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Order Number</label>
                            <input
                                required
                                type="number"
                                placeholder="1"
                                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={formData.orderNumber}
                                onChange={e => setFormData({ ...formData, orderNumber: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Content Type</label>
                            <select
                                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="video">Video</option>
                                <option value="image">Image</option>
                                <option value="text">Text / Article</option>
                                <option value="link">External Link</option>
                                <option value="file">File (PDF/Doc)</option>
                            </select>
                        </div>
                    </div>

                    {/* Dynamic Content Fields */}
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        {formData.type === 'link' ? (
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">
                                    <LinkIcon className="w-4 h-4" /> External URL
                                </label>
                                <input
                                    required
                                    type="url"
                                    placeholder="https://youtube.com/..."
                                    className="w-full p-4 bg-white rounded-2xl font-bold text-slate-700 outline-none border border-slate-200 focus:border-primary transition-all"
                                    value={formData.contentUrl}
                                    onChange={e => setFormData({ ...formData, contentUrl: e.target.value })}
                                />
                            </div>
                        ) : formData.type === 'text' ? (
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">
                                    <FileText className="w-4 h-4" /> Text Content
                                </label>
                                <textarea
                                    required
                                    rows="10"
                                    placeholder="Write your lesson content here using Markdown..."
                                    className="w-full p-4 bg-white rounded-2xl font-medium text-slate-700 outline-none border border-slate-200 focus:border-primary transition-all resize-y"
                                    value={formData.textContent}
                                    onChange={e => setFormData({ ...formData, textContent: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">
                                    {formData.type === 'video' && <Video className="w-4 h-4" />}
                                    {formData.type === 'image' && <ImageIcon className="w-4 h-4" />}
                                    Upload {formData.type}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        required={!lessonToEdit} // Only required if new, otherwise optional to keep existing
                                        accept={
                                            formData.type === 'video' ? 'video/*' :
                                                formData.type === 'image' ? 'image/*' :
                                                    '.pdf,.doc,.docx'
                                        }
                                        className="w-full p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-bold hover:border-primary/50 transition-colors cursor-pointer"
                                        onChange={e => setFile(e.target.files[0])}
                                    />
                                    {lessonToEdit && !file && (
                                        <p className="text-xs text-slate-400 mt-2 ml-2">Leave empty to keep existing file</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4">
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
