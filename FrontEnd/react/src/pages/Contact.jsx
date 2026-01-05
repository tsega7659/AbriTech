import { Phone, Mail, MapPin, Clock, MessageSquare, Users, Building2, HelpCircle } from "lucide-react";

export default function Contact() {
    return (
        <div className="bg-white min-h-screen pb-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
                <div className="w-[800px] h-[800px] bg-[#00B4D8] rounded-full opacity-5 blur-3xl"></div>
            </div>
            <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4">
                <div className="w-[600px] h-[600px] bg-[#FDB813] rounded-full opacity-5 blur-3xl"></div>
            </div>

            <section className="bg-gray-50 py-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Contact Cards - Inspired by User Request */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
                    {/* Email Card */}
                    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-8 text-center hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary group-hover:scale-110 transition-transform shadow-lg">
                            <Mail className="h-6 w-6 text-[#00B4D8]" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
                        <p className="text-sm text-gray-500 mb-4">Send us an email anytime</p>
                        <p className="text-primary font-medium">abritechet@gmail.com</p>
                    </div>

                    {/* Phone Card */}
                    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-8 text-center hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary group-hover:scale-110 transition-transform shadow-lg">
                            <Phone className="h-6 w-6 text-[#00B4D8]" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
                        <p className="text-sm text-gray-500 mb-4">Mon-Fri from 8am to 6pm</p>
                        <p className="text-primary font-medium">+251-961-701470</p>
                    </div>

                    {/* Visit Card */}
                    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-8 text-center hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary group-hover:scale-110 transition-transform shadow-lg">
                            <MapPin className="h-6 w-6 text-[#00B4D8]" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Visit Us</h3>
                        <p className="text-sm text-gray-500 mb-4">Come say hello at our office</p>
                        <p className="text-gray-900 font-medium">Bole, Addis Ababa, Ethiopia</p>
                    </div>

                    {/* Hours Card */}
                    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-8 text-center hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary group-hover:scale-110 transition-transform shadow-lg">
                            <Clock className="h-6 w-6 text-[#00B4D8]" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Working Hours</h3>
                        <p className="text-sm text-gray-500 mb-4">We're available</p>
                        <p className="text-gray-900 font-medium">Mon - Sat: 8:00 AM - 6:00 PM</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
                    {/* Contact Form */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Send Us a Message</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">First Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-[#00B4D8] focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-text-[#00B4D8] transition-all" placeholder="Enter first name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-[#00B4D8] focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-text-[#00B4D8] transition-all" placeholder="Enter last name" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" className="w-full px-4 py-3 rounded-lg border border-[#00B4D8] focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-text-[#00B4D8] transition-all" placeholder="Enter your email" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Message</label>
                                <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-[#00B4D8] focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-text-[#00B4D8] transition-all" placeholder="Type your message..."></textarea>
                            </div>

                            <button type="button" className="w-full bg-text-[#00B4D8] text-white font-bold py-4 rounded-xl hover:bg-text-[#00B4D8]/90 transition-all  hover:-translate-y-1">
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* How Can We Help Cards */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">How Can We Help?</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-6 rounded-xl border border-gray-100 hover:border-text-[#00B4D8]/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                                <Users className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform text-[#FDB813]" />
                                <h3 className="font-bold text-gray-900 mb-1">Student Enrollment</h3>
                                <p className="text-sm text-gray-500">Questions about courses and enrollment</p>
                            </div>
                            <div className="p-6 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                                <Building2 className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform text-[#FDB813]" />
                                <h3 className="font-bold text-gray-900 mb-1">School Partnerships</h3>
                                <p className="text-sm text-gray-500">Partner with us to bring STEM education to your school</p>
                            </div>
                            <div className="p-6 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                                <MessageSquare className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform text-[#FDB813]" />
                                <h3 className="font-bold text-gray-900 mb-1">General Inquiries</h3>
                                <p className="text-sm text-gray-500">Any other questions or feedback</p>
                            </div>
                            <div className="p-6 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                                <HelpCircle className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform text-[#FDB813]" />
                                <h3 className="font-bold text-gray-900 mb-1">Technical Support</h3>
                                <p className="text-sm text-gray-500">Get help with the learning platform</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Frequently Asked Questions</h2>
                    <p className="text-center text-gray-500 mb-8">Find quick answers to common questions about our programs.</p>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            { q: "What age groups do you serve?", a: "We offer programs for students ages 8-18, with age-appropriate curriculum for each group." },
                            { q: "How do I enroll my child?", a: "You can enroll by creating a student account and selecting your preferred courses, or contact us for assistance." },
                            { q: "Do you offer online and in-person classes?", a: "Yes! We offer both online learning through our LMS platform and in-person classes at our Addis Ababa center." }
                        ].map((item, i) => (
                            <div key={i} className="bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.q}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
