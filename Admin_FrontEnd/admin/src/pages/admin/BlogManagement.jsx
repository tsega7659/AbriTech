import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    Plus, Search, Filter, MoreHorizontal, FileText,
    XCircle, Image as ImageIcon, Loader2, Calendar, User
} from 'lucide-react';
import { API_BASE_URL } from '../../config/apiConfig';
import Loading from '../../components/Loading';

const BlogManagement = () => {
    const { blogs, createBlog, loading } = useAdmin();
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newBlog, setNewBlog] = useState({
        title: '',
        content: '',
        coverImage: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewBlog({ ...newBlog, coverImage: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCreateBlog = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('title', newBlog.title);
        formData.append('content', newBlog.content);
        if (newBlog.coverImage) {
            formData.append('coverImage', newBlog.coverImage);
        }

        const result = await createBlog(formData);

        setSubmitting(false);
        if (result.success) {
            setIsAdding(false);
            setNewBlog({ title: '', content: '', coverImage: null });
            setPreviewUrl(null);
        } else {
            alert(result.message);
        }
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
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <FileText className="w-7 h-7 text-primary" /> New Article
                        </h3>
                        <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-xl">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleCreateBlog} className="space-y-6">
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Content</label>
                            <textarea
                                required
                                rows="10"
                                placeholder="Write your article content here..."
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium text-slate-600 leading-relaxed resize-none"
                                value={newBlog.content}
                                onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Publishing...
                                    </>
                                ) : (
                                    <>
                                        Publish Article <FileText className="w-5 h-5" />
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
                                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                                    {blog.content}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <User className="w-4 h-4" />
                                        <span>{blog.authorName || 'Admin'}</span>
                                    </div>
                                    <button className="text-primary font-bold text-sm hover:underline">Read More</button>
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
        </div>
    );
};

export default BlogManagement;
