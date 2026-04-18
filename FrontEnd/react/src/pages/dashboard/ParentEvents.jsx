import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Target, Users, BookOpen } from 'lucide-react';

export default function ParentEvents() {
    // Static placeholder data for an MVP since we don't have a specific event endpoint yet.
    const events = [
        {
            id: 1,
            title: "Parent-Teacher Conference",
            date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
            type: "Meeting",
            location: "Virtual (Zoom)",
            description: "Quarterly review of student progress, performance metrics, and goals alignment.",
            color: "blue"
        },
        {
            id: 2,
            title: "End of Term Project Submissions",
            date: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
            type: "Deadline",
            location: "Learning Portal",
            description: "Final deadline for all capstone projects across advanced courses.",
            color: "purple"
        },
        {
            id: 3,
            title: "STEM Workshop: Robotics 101",
            date: new Date(Date.now() + 86400000 * 15).toISOString(), // 15 days from now
            type: "Workshop",
            location: "Main Campus Hall",
            description: "Interactive session for students to build their first remote robotics module. Parents welcome.",
            color: "orange"
        }
    ];

    const getColorVars = (color) => {
        switch (color) {
            case 'purple': return { bg: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-100', dot: 'bg-purple-400' };
            case 'orange': return { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-100', dot: 'bg-orange-400' };
            default: return { bg: 'bg-blue-50', text: 'text-[#00B4D8]', border: 'border-blue-100', dot: 'bg-[#00B4D8]' };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <header>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                    Upcoming <span className="text-[#00B4D8]">Events</span>
                </h1>
                <p className="text-gray-500 mt-2 text-lg font-medium">Keep track of important deadlines, conferences, and academic workshops.</p>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[28px] md:before:ml-[36px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-100 before:via-gray-100 before:to-transparent">
                    {events.map((event, idx) => {
                        const style = getColorVars(event.color);
                        
                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                            >
                                {/* Marker */}
                                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl border-4 border-white ${style.bg} ${style.text} shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                                    <Calendar className="w-6 h-6" />
                                </div>
                                
                                {/* Card */}
                                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl border ${style.border} bg-white shadow-sm hover:shadow-md transition-shadow`}>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
                                                {event.type}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold">
                                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-gray-900 mt-2">{event.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">{event.description}</p>
                                        
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 text-gray-500">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-xs font-bold">{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[#00B4D8]/5 to-blue-50 border border-blue-100 rounded-[2rem] p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
            >
                <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#00B4D8] shadow-sm flex-shrink-0">
                         <MapPin className="w-8 h-8" />
                     </div>
                     <div>
                         <h3 className="text-lg font-black text-gray-900">Sync with your Calendar</h3>
                         <p className="text-sm text-gray-600 font-medium mt-1 max-w-md">Never miss a deadline or conference. Integrate the school's event schedule directly to your personal device.</p>
                     </div>
                </div>
                <button className="whitespace-nowrap px-6 py-3 bg-[#00B4D8] hover:bg-blue-400 active:bg-blue-600 text-white font-bold rounded-xl shadow-sm transition-all shadow-[#00B4D8]/20 w-full sm:w-auto">
                    Sync Calendar
                </button>
            </motion.div>
        </div>
    );
}
