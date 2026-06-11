import React, { useState } from 'react';
import { useAdminBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog } from '../../hooks/useAdminQueries';
import {
    XCircle, Image as ImageIcon, Loader2, Calendar, User,
    Trash2, Video, Link as LinkCircle, Paperclip, ChevronDown, Plus, FileText, ExternalLink, X,
    ArrowLeft, Tag
} from 'lucide-react';
import { API_BASE_URL } from '../../config/apiConfig';
import Loading from '../../components/Loading';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import FeedbackModal from '../../components/FeedbackModal';

// Blog Reader View - Mimicking Public Frontend UI
const BlogReaderView = ({ blog, onClose }) => {
    if (!blog) return null;
    let sections = [];
    try {
        const parsed = JSON.parse(blog.content);
        sections = Array.isArray(parsed) ? parsed : [{ body: blog.content }];
    } catch {
        sections = [{ body: blog.content }];
    }

    const mediaBase = API_BASE_URL.replace('/api', '');

    return (
        <div className="fixed inset-0 z-[110] bg-white overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Nav / Controls */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 py-4">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:translate-x-[-4px] transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Preview View</span>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 pointer-events-none">
                <div className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Header Hero Section */}
            <section className="bg-slate-50/50 py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[24px_24px] opacity-30"></div>
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm border border-primary/5">
                            <Tag className="h-3 w-3" /> News
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span className="text-slate-400 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
                            <Calendar className="h-4 w-4" /> {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-10 leading-tight tracking-tight">
                        {blog.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-primary to-primary-dark p-[1px] shadow-lg">
                            <div className="w-full h-full rounded-[1.2rem] bg-white flex items-center justify-center text-primary font-black text-xl">
                                {(blog.authorName || 'A')[0]}
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-slate-900 font-black text-lg tracking-tight">{blog.authorName || 'AbriTech Team'}</p>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Article Author</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Body */}
            <div className="max-w-4xl mx-auto px-6 py-16 -mt-8 relative z-20">
                {/* Hero Image */}
                <div className="rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 mb-16 bg-slate-100 border-8 border-white">
                    {blog.coverImage ? (
                        <img
                            src={blog.coverImage.startsWith('http') ? blog.coverImage : `${mediaBase}${blog.coverImage}`}
                            alt={blog.title}
                            className="w-full h-auto object-cover max-h-[600px] transition-transform hover:scale-105 duration-700"
                        />
                    ) : (
                        <div className="h-[400px] flex items-center justify-center text-slate-300 bg-slate-50">
                            <FileText className="w-20 h-20 opacity-20" />
                        </div>
                    )}
                </div>

                <div className="space-y-12">
                    {sections.map((section, index) => (
                        <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                            {section.subtitle && (
                                <h2 className="text-3xl font-black text-primary mb-6 mt-12 hover:underline decoration-primary/30 underline-offset-8 transition-all">
                                    {section.subtitle}
                                </h2>
                            )}

                            {section.mediaType && section.mediaType !== 'none' && (
                                <div className="my-12 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 bg-slate-50/50 group">
                                    {section.mediaType === 'image' && section.mediaUrl && (
                                        <img
                                            src={section.mediaUrl.startsWith('http') ? section.mediaUrl : `${mediaBase}${section.mediaUrl}`}
                                            alt={section.subtitle}
                                            className="w-full h-auto object-cover max-h-[700px] transition-transform duration-500 group-hover:scale-[1.02]"
                                        />
                                    )}
                                    {section.mediaType === 'video' && section.mediaUrl && (
                                        <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden group">
                                            <video
                                                controls
                                                className="w-full h-full"
                                                src={section.mediaUrl.startsWith('http') ? section.mediaUrl : `${mediaBase}${section.mediaUrl}`}
                                            ></video>
                                        </div>
                                    )}
                                    {section.mediaType === 'link' && section.mediaUrl && (
                                        <div className="p-10 flex flex-col items-center gap-6 py-12">
                                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-inner">
                                                <LinkCircle className="w-10 h-10" />
                                            </div>
                                            <div className="text-center">
                                                <h4 className="font-black text-slate-800 text-xl mb-2">Resource Attachment</h4>
                                                <p className="text-sm font-bold text-slate-400 mb-6 truncate max-w-sm mx-auto">{section.mediaUrl}</p>
                                                <a
                                                    href={section.mediaUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 active:scale-95"
                                                >
                                                    Open Resource <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="whitespace-pre-line text-xl leading-relaxed text-slate-600 font-medium text-justify">
                                {section.body}
                            </p>
                        </div>
                    ))}

                    <div className="mt-20 p-12 bg-slate-50/80 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                            <FileText className="w-32 h-32" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                            <div className="w-2 h-8 bg-primary rounded-full" />
                            Platform Insight
                        </h3>
                        <p className="text-slate-500 font-bold leading-relaxed">
                            This is a live preview of how the article appears to students and visitors on the AbriTech platform.
                            Use the Edit tools back in the dashboard to refine the content, add media, or update the formatting.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer space */}
            <div className="h-32" />
        </div>
    );
};

const BlogManagement = () => {
    const { data: blogs = [], isLoading: loading } = useAdminBlogs();
    const createBlogMutation = useCreateBlog();
    const updateBlogMutation = useUpdateBlog();
    const deleteBlogMutation = useDeleteBlog();
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [readMoreBlog, setReadMoreBlog] = useState(null);
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
        try {
            await deleteBlogMutation.mutateAsync(blogToDelete.id);
            setIsDeleteModalOpen(false);
            setBlogToDelete(null);
        } catch (error) {
            showFeedback("Operation Failed", error.response?.data?.message || "Failed to delete article", "error");
        } finally {
            setIsDeleting(false);
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
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('title', newBlog.title);
        if (newBlog.coverImage) {
            formData.append('image', newBlog.coverImage);
        }

        sections.forEach((section) => {
            if (section.file) {
                formData.append('sectionMedia', section.file);
            }
        });

        const sectionsData = sections.map(s => ({
            subtitle: s.subtitle,
            body: s.body,
            mediaType: s.mediaType,
            mediaUrl: s.file ? '' : s.mediaUrl
        }));
        formData.append('content', JSON.stringify(sectionsData));

        const mutationToUse = isEditing ? updateBlogMutation : createBlogMutation;
        const mutationParams = isEditing
            ? { id: isEditing, formData, onProgress: (p) => setUploadProgress(p) }
            : { formData, onProgress: (p) => setUploadProgress(p) };

        try {
            await mutationToUse.mutateAsync(mutationParams, {
                onSuccess: () => {
                    setIsAdding(false);
                    setIsEditing(null);
                    setNewBlog({ title: '', content: '', coverImage: null });
                    setSections([{ subtitle: '', body: '', mediaType: 'none', mediaUrl: '', file: null }]);
                    setPreviewUrl(null);
                    showFeedback("Success", `Article ${isEditing ? 'updated' : 'published'} successfully!`, "success");
                },
                onError: (error) => {
                    showFeedback("Operation Failed", error.response?.data?.message || "Failed to save article", "error");
                }
            });
        } catch (error) {
            console.error('Mutation error:', error);
        } finally {
            setSubmitting(false);
            setUploadProgress(0);
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

        try {
            const parsedContent = JSON.parse(blog.content);
            if (Array.isArray(parsedContent)) {
                setSections(parsedContent.map(s => ({
                    ...s,
                    file: null
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
        <div className="space-y-8 h-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 md:px-0">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Blog Management</h1>
                    <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Create and manage news and articles</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-[1.25rem] font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all w-full md:w-auto uppercase tracking-widest text-xs"
                    >
                        <Plus className="w-5 h-5" /> Write New Blog
                    </button>
                )}
            </div>

            {/* Create Blog Form */}
            {isAdding && (
                <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <FileText className="w-6 h-6" />
                                </div>
                                {isEditing ? 'Edit Article' : 'New Article'}
                            </h3>
                            {submitting && (
                                <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                            {uploadProgress < 100 ? 'Uploading content...' : 'Finalizing publication...'}
                                        </span>
                                        <span className="text-[10px] font-black text-primary">{uploadProgress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div
                                            className="h-full bg-primary transition-all duration-300 ease-out"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={handleCancel} disabled={submitting} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-3 rounded-2xl disabled:opacity-50">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleCreateOrUpdateBlog} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Article Title</label>
                            <input
                                type="text"
                                required
                                placeholder="Enter a catchy title..."
                                className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] focus:bg-white focus:border-primary focus:outline-none transition-all font-black text-slate-700 text-xl placeholder:text-slate-300"
                                value={newBlog.title}
                                onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Cover Image</label>
                            <div className="flex gap-6 items-start">
                                <div className="relative group flex-1">
                                    <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full pl-16 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-600 file:mr-6 file:py-2 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary file:text-white hover:file:bg-primary-dark transition-all"
                                    />
                                </div>
                                {previewUrl && (
                                    <div className="w-32 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg shrink-0">
                                        <img src={previewUrl.startsWith('blob') ? previewUrl : (previewUrl.startsWith('http') ? previewUrl : `${mediaBase}${previewUrl}`)} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between px-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Story Composition</label>
                            </div>

                            {sections.map((section, index) => (
                                <div key={index} className="p-8 bg-slate-50/30 rounded-[2.5rem] border border-slate-100 space-y-8 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                {index + 1}
                                            </div>
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Module Section</h4>
                                        </div>
                                        {sections.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSection(index)}
                                                className="text-rose-400 hover:text-rose-600 transition-colors p-2 bg-white rounded-xl border border-slate-100 shadow-sm"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Subtitle</label>
                                            <input
                                                type="text"
                                                placeholder="Enter section subtitle..."
                                                className="w-full px-6 py-4 bg-white border border-slate-100 rounded-[1.25rem] focus:border-primary focus:outline-none transition-all font-black text-slate-700 placeholder:text-slate-300"
                                                value={section.subtitle}
                                                onChange={(e) => handleSectionChange(index, 'subtitle', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Media Asset Type</label>
                                            <div className="flex flex-wrap gap-3">
                                                {['none', 'image', 'video', 'link'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => handleSectionChange(index, 'mediaType', type)}
                                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${section.mediaType === type
                                                            ? 'bg-slate-800 text-white shadow-xl shadow-slate-200'
                                                            : 'bg-white text-slate-400 border border-slate-100 hover:border-primary/20'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {section.mediaType !== 'none' && (
                                            <div className="space-y-3 animate-in slide-in-from-left-2 duration-300">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">
                                                    {section.mediaType === 'link' ? 'External Destination URL' : `Source ${section.mediaType} file`}
                                                </label>
                                                {section.mediaType === 'link' ? (
                                                    <div className="relative">
                                                        <LinkCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                        <input
                                                            type="url"
                                                            placeholder="https://awesome-resource.com"
                                                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[1.25rem] focus:border-primary focus:outline-none transition-all font-bold text-slate-700"
                                                            value={section.mediaUrl}
                                                            onChange={(e) => handleSectionChange(index, 'mediaUrl', e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-6">
                                                        <div className="relative flex-1">
                                                            <Paperclip className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
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
                                                                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[1.25rem] focus:border-primary focus:outline-none transition-all font-bold text-slate-700 file:hidden"
                                                            />
                                                            <p className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary uppercase tracking-widest">Select File</p>
                                                        </div>
                                                        {section.mediaUrl && (
                                                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white bg-slate-50 flex items-center justify-center shrink-0 shadow-lg">
                                                                {section.mediaType === 'image' ? (
                                                                    <img src={section.mediaUrl.startsWith('blob') ? section.mediaUrl : (section.mediaUrl.startsWith('http') ? section.mediaUrl : `${mediaBase}${section.mediaUrl}`)} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Video className="w-8 h-8 text-primary" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Body Content</label>
                                            <textarea
                                                required
                                                rows="6"
                                                placeholder="Write your beautiful story here..."
                                                className="w-full px-8 py-6 bg-white border border-slate-100 rounded-[1.5rem] focus:border-primary focus:outline-none transition-all font-bold text-slate-700 leading-relaxed placeholder:text-slate-200"
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
                                className="w-full py-5 border-4 border-dashed border-slate-50 rounded-[2rem] text-slate-300 font-black uppercase tracking-widest text-[10px] hover:border-primary/20 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
                            >
                                <Plus className="w-6 h-6" /> Append Module Section
                            </button>
                        </div>

                        <div className="flex justify-end pt-8 border-t border-slate-50">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-10 py-5 bg-primary text-white rounded-[1.5rem] font-black shadow-2xl shadow-primary/30 hover:shadow-primary/50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 uppercase tracking-[0.15em] text-xs"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Transmitting...
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? 'Sync Updates' : 'Publish to Feed'} <ArrowLeft className="w-5 h-5 rotate-180" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Content List */}
            {loading ? (
                <Loading fullScreen={false} message="Synchronizing news feed..." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBlogs.map(blog => (
                        <div key={blog.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 group flex flex-col h-full relative">
                            <div className="relative h-60 overflow-hidden bg-slate-50">
                                {blog.coverImage ? (
                                    <img
                                        src={blog.coverImage.startsWith('http') ? blog.coverImage : `${mediaBase}${blog.coverImage}`}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-100 bg-slate-50">
                                        <FileText className="w-20 h-20" />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg text-slate-800">
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <div className="p-8 flex flex-col flex-1">
                                <h3 className="text-xl font-black text-slate-800 mb-4 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                    {blog.title}
                                </h3>
                                <p className="text-slate-400 text-sm font-bold mb-8 line-clamp-3 leading-relaxed flex-grow">
                                    {(() => {
                                        try {
                                            const sections = JSON.parse(blog.content);
                                            return Array.isArray(sections) ? sections[0].body : blog.content;
                                        } catch {
                                            return blog.content;
                                        }
                                    })()}
                                </p>

                                <div className="flex items-center justify-between pt-8 border-t border-slate-50 mt-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-black text-sm">
                                            {(blog.authorName || 'A')[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-700 tracking-tight">{blog.authorName || 'Admin'}</span>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Author</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleEditClick(blog)}
                                            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all border border-transparent shadow-sm"
                                        >
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(blog)}
                                            className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-transparent shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setReadMoreBlog(blog)}
                                            className="ml-2 px-5 py-2.5 bg-slate-800 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
                                        >
                                            Preview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredBlogs.length === 0 && (
                <div className="text-center py-32 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-slate-100">
                        <FileText className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Feed is currently silent</h3>
                    <p className="text-slate-400 font-bold text-sm">Initiate the first publication to broadcast content.</p>
                </div>
            )}

            {/* Blog Reader View - Mimics Public UI */}
            {readMoreBlog && (
                <BlogReaderView blog={readMoreBlog} onClose={() => setReadMoreBlog(null)} />
            )}

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Deconstruct Publication"
                message="Are you sure you want to permanently erase this article? This operation cannot be reversed."
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
