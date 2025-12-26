import { Target, Eye, Users, Globe, Lightbulb, Handshake, Heart } from "lucide-react";

const values = [
    { title: "Innovation", desc: "Always seeking better ways to educate and inspire our students through cutting-edge technology.", icon: Lightbulb },
    { title: "Accessibility", desc: "Education for all, regardless of background or location.", icon: Globe },
    { title: "Collaboration", desc: "Working with schools, communities, and partners to create a comprehensive ecosystem.", icon: Handshake },
    { title: "Impact", desc: "Making a measurable difference in students' lives through practical skills.", icon: Heart },
];

export default function About() {
    return (
        <div className="bg-white pb-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
                <div className="w-[800px] h-[800px] bg-[#00B4D8] rounded-full opacity-5 blur-3xl"></div>
            </div>
            <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4">
                <div className="w-[600px] h-[600px] bg-[#FDB813] rounded-full opacity-5 blur-3xl"></div>
            </div>

            {/* Header */}
            <section className="bg-gray-50 py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About AbriTech Solutions</h1>
                    <p className="text-xl text-gray-600">
                        Connecting Education to Innovation through comprehensive STEM and robotics education.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                {/* Story */}
                <section className="mb-20">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    AbriTech Solutions is an Ethiopian EdTech startup dedicated to making high-quality STEM education accessible, affordable, and relevant for Ethiopian youth. We focus on age-targeted, project-based, and locally relevant curricula.
                                </p>
                                <p>
                                    Our commitment extends beyond traditional education methods, integrating innovative teaching approaches that prepare students for the technology-driven future while addressing the unique challenges and opportunities within the Ethiopian educational landscape.
                                </p>
                            </div>
                        </div>
                        <div className="flex-1">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                                alt="Team collaboration"
                                className="rounded-2xl shadow-xl"
                            />
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <div className="bg-[#00B4D8]/5  p-10 rounded-3xl border border-[#00B4D8] hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group">
                        <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-6 text-primary group-hover:scale-110 transition-transform">
                            <Target className="h-8 w-8 text-[#00B4D8]" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                        <p className="text-gray-700 leading-relaxed">
                            To provide affordable, engaging, and accessible STEM and robotics education tailored to the Ethiopian context—empowering a generation to drive technological and economic growth.
                        </p>
                    </div>
                    <div className="bg-[#00B4D8]/5  p-10 rounded-3xl border border-[#00B4D8] hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group">
                        <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-6 text-primary group-hover:scale-110 transition-transform">
                            <Eye className="h-8 w-8 text-[#00B4D8]" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                        <p className="text-gray-700 leading-relaxed">
                            To create a future where every young Ethiopian can access the skills and opportunities needed to innovate, solve problems, and lead in technology and engineering.
                        </p>
                    </div>
                </section>

                {/* Values */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((v, i) => (
                            <div key={i} className="text-center group p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform shadow-lg">
                                    <v.icon className="h-8 w-8 text-[#00B4D8]" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                                <p className="text-gray-600 text-sm">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Partnerships */}
                <section className="text-center bg-gray-900 text-white rounded-3xl p-12">
                    <h2 className="text-2xl font-bold mb-8">Our Partnerships</h2>
                    <p className="max-w-2xl mx-auto mb-10 text-gray-400">
                        We are proud to work with organizations like Lela Learning Center, Innobiz-K, and MinT to enhance our credibility and reach.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 opacity-70">
                        {['Lela Learning Center', 'Innobiz-K', 'MinT', 'Addis Bike', 'Addis Technology Solutions'].map((partner) => (
                            <span key={partner} className="border border-white/20 px-6 py-2 rounded-full text-sm">
                                {partner}
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
