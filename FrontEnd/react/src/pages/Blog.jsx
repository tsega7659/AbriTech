import { Calendar, User, ArrowRight } from "lucide-react";

const posts = [
    {
        title: "The Future of STEM Education in Ethiopia",
        excerpt: "Exploring how technology and innovation are reshaping educational opportunities for Ethiopian students.",
        date: "Dec 15, 2024",
        author: "Dr. Abebe G.",
        category: "Education",
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Building Tomorrow's Innovators Through Robotics",
        excerpt: "How hands-on robotics education is developing critical thinking and problem-solving skills.",
        date: "Dec 10, 2024",
        author: "Sara T.",
        category: "Robotics",
        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Bridging the Digital Divide",
        excerpt: "Addressing challenges in making quality STEM education accessible to students across urban and rural Ethiopia.",
        date: "Dec 5, 2024",
        author: "Team AbriTech",
        category: "Impact",
        image: "https://images.unsplash.com/photo-1488190211105-8b0e6d280d2e?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Arduino Programming: Gateway to Innovation",
        excerpt: "Why Arduino programming serves as the perfect introduction to electronics for students.",
        date: "Nov 28, 2024",
        author: "Tech Team",
        category: "Programming",
        image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=800"
    }
];

export default function Blog() {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {posts.map((post, index) => (
                        <div key={index} className="group bg-linear-to-br from-white to-gray-50 rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2">
                            <div className="h-64 overflow-hidden relative">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
                                    {post.category}
                                </div>
                                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center text-sm text-gray-500 mb-4 gap-4">
                                    <span className="flex items-center gap-1 text-primary"><Calendar className="h-4 w-4 text-[#00B4D8]" /> {post.date}</span>
                                    <span className="flex items-center gap-1 text-primary"><User className="h-4 w-4 text-[#00B4D8]" /> {post.author}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-primary cursor-pointer transition-colors group-hover:text-primary">
                                    {post.title}
                                </h2>
                                <p className="text-gray-600 mb-6 leading-relaxed grow">
                                    {post.excerpt}
                                </p>
                                <button className="text-[#00B4D8] font-semibold hover:font-bold self-start flex items-center gap-2 group/btn">
                                    Read Article <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform " />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
