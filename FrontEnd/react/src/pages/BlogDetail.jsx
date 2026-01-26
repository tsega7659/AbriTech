import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://abritech.onrender.com/api';

export default function BlogDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/blogs/${id}`);
                if (!response.ok) {
                    throw new Error('Blog not found');
                }
                const data = await response.json();
                setPost(data);
            } catch (err) {
                console.error("Failed to fetch blog:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBlog();
        }
    }, [id]);

    if (loading) {
        return (
            <Loading fullScreen={false} message="Loading article..." />
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
                    <Link to="/blog" className="text-[#00B4D8] hover:underline flex items-center gap-2 justify-center">
                        <ArrowLeft className="h-4 w-4" /> Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
                <div className="w-200 h-200 bg-[#00B4D8] rounded-full opacity-5 blur-3xl"></div>
            </div>
            <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4">
                <div className="w-150 h-150 bg-[#FDB813] rounded-full opacity-5 blur-3xl"></div>
            </div>

            <section className="bg-gray-50 py-10 mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-[#00B4D8] font-semibold mb-6 hover:translate-x-[-4px] transition-transform">
                        <ArrowLeft className="h-4 w-4" /> Back to Blog
                    </Link>
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-[#00B4D8]/10 text-[#00B4D8] px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                <Tag className="h-3 w-3" /> News
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500 flex items-center gap-1 text-sm">
                                <Calendar className="h-4 w-4" /> {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#00B4D8]/20 flex items-center justify-center text-[#00B4D8] font-bold">
                                {(post.authorName || 'AbriTech')[0]}
                            </div>
                            <div>
                                <p className="text-gray-900 font-semibold">{'AbriTech Team'}</p>
                                <p className="text-gray-500 text-sm">Author</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4">
                <div className="rounded-3xl overflow-hidden shadow-2xl mb-12 bg-gray-100">
                    {post.coverImage ? (
                        <img
                            src={post.coverImage.startsWith('http') ? post.coverImage : `${API_BASE_URL.replace('/api', '')}${post.coverImage}`}
                            alt={post.title}
                            className="w-full h-auto object-cover max-h-[500px]"
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">No Cover Image</div>
                    )}
                </div>

                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <div className="space-y-8">
                        {(() => {
                            try {
                                const sections = JSON.parse(post.content);
                                if (Array.isArray(sections)) {
                                    return sections.map((section, index) => (
                                        <div key={index}>
                                            {section.subtitle && (
                                                <h2 className="text-2xl font-bold text-[#00B4D8] hover:underline mb-3 mt-8">
                                                    {section.subtitle}
                                                </h2>
                                            )}
                                            <p className="whitespace-pre-line text-lg leading-relaxed text-gray-600 w-full text-justify px-2 md:px-0">
                                                {section.body}
                                            </p>
                                        </div>
                                    ));
                                }
                                throw new Error('Not an array');
                            } catch (e) {
                                // Fallback for legacy plain text content
                                return (
                                    <div className="whitespace-pre-line text-lg leading-relaxed text-justify px-2 md:px-0">
                                        {post.content}
                                    </div>
                                );
                            }
                        })()}
                    </div>

                    <div className="mt-12 p-8 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-[#00B4D8]">About AbriTech</h3>
                        <p className="text-gray-600">
                            AbriTech is dedicated to empowering students in Ethiopia through cutting-edge STEM education and practical engineering experiences. We believe in building a future where every child has the opportunity to innovate and grow.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
