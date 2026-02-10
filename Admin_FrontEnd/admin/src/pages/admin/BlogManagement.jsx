import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    XCircle, Image as ImageIcon, Loader2, Calendar, User,
    Trash2, Video, Link, Paperclip, ChevronDown, Plus, FileText
} from 'lucide-react';
import { API_BASE_URL } from '../../config/apiConfig';
import Loading from '../../components/Loading';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import FeedbackModal from '../../components/FeedbackModal';

const BlogManagement = () => {
    const { blogs, createBlog, updateBlog, deleteBlog, loading } = useAdmin();
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(null); // Stores the blog ID being edited
    const [searchTerm, setSearchTerm] = useState('');
    const [newBlog, setNewBlog] = useState({
        title: '',
        content: '',
        coverImage: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const showFeedback = (title, message, type = 'success') => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const handleDeleteClick = (blog) => {
        setBlogToDelete(blog);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!blogToDelete) return;

        setIsDeleting(true);
        const result = await deleteBlog(blogToDelete.id);
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setBlogToDelete(null);

        if (!result.success) {
            showFeedback("Operation Failed", result.message || "Failed to delete article", "error");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showFeedback("File Too Large", "Maximum image size is 5MB. Please choose a smaller file.", "warning");
                e.target.value = null;
                return;
            }
            setNewBlog({ ...newBlog, coverImage: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const [sections, setSections] = useState([{ subtitle: '', body: '', mediaType: 'none', mediaUrl: '', file: null }]);

    const handleAddSection = () => {
        setSections([...sections, { subtitle: '', body: '', mediaType: 'none', mediaUrl: '', file: null }]);
    };

    const handleRemoveSection = (index) => {
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections);
    };

    const handleSectionChange = (index, field, value) => {
        const newSections = [...sections];
        newSections[index][field] = value;
        setSections(newSections);
    };

    const handleCreateOrUpdateBlog = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('title', newBlog.title);
        if (newBlog.coverImage) {
            formData.append('image', newBlog.coverImage);
        }

        // Append section media files
        sections.forEach((section) => {
            if (section.file) {
                formData.append('sectionMedia', section.file);
            }
        });

        // Prepare sections for JSON (remove file objects and reset mediaUrl if new file)
        const sectionsData = sections.map(s => ({
            subtitle: s.subtitle,
            body: s.body,
            mediaType: s.mediaType,
            mediaUrl: s.file ? '' : s.mediaUrl // Empty means new upload from sectionMedia array to backend
        }));
        formData.append('content', JSON.stringify(sectionsData));

        let result;
        setUploadProgress(0);
        if (isEditing) {
            result = await updateBlog(isEditing, formData, (p) => setUploadProgress(p));
        } else {
            result = await createBlog(formData, (p) => setUploadProgress(p));
        }

        setSubmitting(false);
        setUploadProgress(0);
        if (result.success) {
            setIsAdding(false);
            setIsEditing(null);
            setNewBlog({ title: '', content: '', coverImage: null });
            setSections([{ subtitle: '', body: '', mediaType: 'none', mediaUrl: '', file: null }]); // Reset sections
            setPreviewUrl(null);
            showFeedback("Success", `Article ${isEditing ? 'updated' : 'published'} successfully!`, "success");
        } else {
            showFeedback("Operation Failed", result.message || "Failed to save article", "error");
        }
    };

    const handleEditClick = (blog) => {
        setIsEditing(blog.id);
        setIsAdding(true);
        setNewBlog({
            title: blog.title,
            coverImage: null
        });
        setPreviewUrl(blog.coverImage);

        // Try to parse content as JSON, fallback to single section if plain text
        try {
            const parsedContent = JSON.parse(blog.content);
            if (Array.isArray(parsedContent)) {
                setSections(parsedContent.map(s => ({
                    ...s,
                    file: null // Files are never returned from API as File objects
                })));
            } else {
                setSections([{ subtitle: '', body: blog.content, mediaType: 'none', mediaUrl: '', file: null }]);
            }
        } catch (e) {
            setSections([{ subtitle: '', body: blog.content, mediaType: 'none', mediaUrl: '', file: null }]);
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setIsEditing(null);
        setNewBlog({ title: '', content: '', coverImage: null });
        setSections([{ subtitle: '', body: '', mediaType: 'none', mediaUrl: '', file: null }]);
        setPreviewUrl(null);
    };

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Blog Management</h1>
                    <p className="text-slate-500 font-medium mt-1">Create and manage news and articles</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all w-full md:w-auto"
                    >
                        <Plus className="w-5 h-5" /> Write New Blog
                    </button>
                )}
            </div>

            {/* Create Blog Form */}
            {isAdding && (
                <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-primary/20 shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <FileText className="w-7 h-7 text-primary" /> {isEditing ? 'Edit Article' : 'New Article'}
                            </h3>
                            {submitting && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                            {uploadProgress < 100 ? 'Uploading content...' : 'Finalizing publication...'}
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

                    <form onSubmit={handleCreateOrUpdateBlog} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Article Title</label>
                            <input
                                type="text"
                                required
                                placeholder="Enter a catchy title..."
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-700 text-lg"
                                value={newBlog.title}
                                onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cover Image</label>
                            <div className="flex gap-6 items-start">
                                <div className="relative group flex-1">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                    />
                                </div>
                                {previewUrl && (
                                    <div className="w-32 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dynamic Sections */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Article Sections</label>
                            </div>

                            {sections.map((section, index) => (
                                <div key={index} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Section {index + 1}</h4>
                                        {sections.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSection(index)}
                                                className="text-rose-500 hover:text-rose-600 transition-colors p-1"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Subtitle (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="Section subtitle..."
                                                className="w-full px-6 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                                value={section.subtitle}
                                                onChange={(e) => handleSectionChange(index, 'subtitle', e.target.value)}
                                            />
                                        </div>

                                        {/* Media Type Selection */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Section Media</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['none', 'image', 'video', 'link'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => handleSectionChange(index, 'mediaType', type)}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${section.mediaType === type
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                            : 'bg-white text-slate-400 border border-slate-200 hover:border-primary/30'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Dynamic Media Input */}
                                        {section.mediaType !== 'none' && (
                                            <div className="space-y-2 animate-in slide-in-from-left-2 duration-200">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                                    {section.mediaType === 'link' ? 'External URL' : `Upload ${section.mediaType}`}
                                                </label>
                                                <div className="relative group">
                                                    {section.mediaType === 'link' ? (
                                                        <>
                                                            <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                            <input
                                                                type="url"
                                                                placeholder="https://..."
                                                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-primary focus:outline-none transition-all font-medium text-slate-700"
                                                                value={section.mediaUrl}
                                                                onChange={(e) => handleSectionChange(index, 'mediaUrl', e.target.value)}
                                                            />
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative flex-1">
                                                                <Paperclip className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                                <input
                                                                    type="file"
                                                                    accept={section.mediaType === 'image' ? 'image/*' : 'video/*'}
                                                                    onChange={(e) => {
                                                                        const file = e.target.files[0];
                                                                        if (file) {
                                                                            const newSections = [...sections];
                                                                            newSections[index].file = file;
                                                                            newSections[index].mediaUrl = URL.createObjectURL(file);
                                                                            setSections(newSections);
                                                                        }
                                                                    }}
                                                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-primary focus:outline-none transition-all font-medium text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary/10 file:text-primary"
                                                                />
                                                            </div>
                                                            {section.mediaUrl && (
                                                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0">
                                                                    {section.mediaType === 'image' ? (
                                                                        <img src={section.mediaUrl.startsWith('http') ? section.mediaUrl : (section.mediaUrl.startsWith('blob') ? section.mediaUrl : `${API_BASE_URL.replace('/api', '')}${section.mediaUrl}`)} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Video className="w-6 h-6 text-primary" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Section Content</label>
                                            <textarea
                                                required
                                                rows="5"
                                                placeholder="Write your section content here..."
                                                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-primary focus:outline-none transition-all font-medium text-slate-700 leading-relaxed"
                                                value={section.body}
                                                onChange={(e) => handleSectionChange(index, 'body', e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddSection}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Add Another Section
                            </button>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> {isEditing ? 'Updating...' : 'Publishing...'}
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? 'Update Article' : 'Publish Article'} <FileText className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Blog List or Loading */}
            {loading.blogs ? (
                <Loading fullScreen={false} message="Loading articles..." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map(blog => (
                        <div key={blog.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                            <div className="relative h-48 overflow-hidden bg-slate-100">
                                {blog.coverImage ? (
                                    <img
                                        src={blog.coverImage.startsWith('http') ? blog.coverImage : `${API_BASE_URL.replace('/api', '')}${blog.coverImage}`}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <FileText className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-xs font-bold rounded-lg shadow-sm text-slate-700">
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                    {blog.title}
                                </h3>
                                {/* Parse and display partial content if it's JSON */}
                                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                                    {(() => {
                                        try {
                                            const sections = JSON.parse(blog.content);
                                            return Array.isArray(sections) ? sections[0].body : blog.content;
                                        } catch {
                                            return blog.content;
                                        }
                                    })()}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <User className="w-4 h-4" />
                                        <span>{blog.authorName || 'Admin'}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleEditClick(blog)}
                                            className="text-primary font-bold text-sm hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(blog)}
                                            className="text-rose-500 font-bold text-sm hover:underline"
                                        >
                                            Delete
                                        </button>
                                        <button className="text-slate-400 font-bold text-sm hover:text-slate-600">Read More</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading.blogs && filteredBlogs.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No Articles Found</h3>
                    <p className="text-slate-500">Start writing to share news and updates.</p>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Blog Post"
                message="Are you sure you want to delete this article? This action will permanently remove the post and its cover image."
                itemName={blogToDelete?.title}
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

export default BlogManagement;
