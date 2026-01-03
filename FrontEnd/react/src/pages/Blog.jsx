import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://abritech.onrender.com/api';

export default function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/blogs`);
                const data = await response.json();
                if (response.ok) {
                    setBlogs(data);
                }
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);


    return (
        <div className="bg-white min-h-screen pb-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
                <div className="w-200 h-200 bg-[#00B4D8] rounded-full opacity-5 blur-3xl"></div>
            </div>
            <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4">
                <div className="w-150 h-150 bg-[#FDB813] rounded-full opacity-5 blur-3xl"></div>
            </div>

            <section className="bg-gray-50 py-16 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30"></div>
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <span className="text-[#00B4D8] font-bold tracking-wider text-sm uppercase mb-2 block">Latest Updates</span>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Empowering Technology Education and Engineering Services in Ethiopia
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <Loading fullScreen={false} message="Loading articles..." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {blogs.map((post) => (
                            <Link to={`/blog/${post.id}`} key={post.id} className="group bg-linear-to-br from-white to-gray-50 rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
                                <div className="h-64 overflow-hidden relative bg-gray-200">
                                    {post.coverImage ? (
                                        <img
                                            src={post.coverImage.startsWith('http') ? post.coverImage : `${API_BASE_URL.replace('/api', '')}${post.coverImage}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
                                        News
                                    </div>
                                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center text-sm text-gray-500 mb-4 gap-4">
                                        <span className="flex items-center gap-1 text-primary"><Calendar className="h-4 w-4 text-[#00B4D8]" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1 text-primary"><User className="h-4 w-4 text-[#00B4D8]" /> {post.authorName || 'AbriTech'}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-primary cursor-pointer transition-colors group-hover:text-primary line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-600 mb-6 leading-relaxed flex-grow line-clamp-3">
                                        {post.content}
                                    </p>
                                    <div className="text-[#00B4D8] font-semibold hover:font-bold self-start mt-auto flex items-center gap-2 group/btn">
                                        Read Article <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform " />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                {!loading && blogs.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No articles posted yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

