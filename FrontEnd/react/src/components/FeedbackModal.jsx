import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function FeedbackModal({ isOpen, onClose, title, message, type = "success" }) {
    const configs = {
        success: {
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-50",
            ring: "ring-green-100/50",
            button: "bg-green-500 hover:bg-green-600 shadow-green-200"
        },
        error: {
            icon: AlertCircle,
            color: "text-rose-500",
            bg: "bg-rose-50",
            ring: "ring-rose-100/50",
            button: "bg-rose-500 hover:bg-rose-600 shadow-rose-200"
        },
        warning: {
            icon: AlertCircle,
            color: "text-amber-500",
            bg: "bg-amber-50",
            ring: "ring-amber-100/50",
            button: "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
        },
        info: {
            icon: Info,
            color: "text-blue-500",
            bg: "bg-blue-50",
            ring: "ring-blue-100/50",
            button: "bg-blue-500 hover:bg-blue-600 shadow-blue-200"
        }
    };

    const config = configs[type] || configs.success;
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden z-10"
                    >
                        {/* Header/Icon */}
                        <div className={`${config.bg} p-8 flex justify-center relative`}>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-500 hover:bg-white/50 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className={`w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center ${config.color} ring-8 ${config.ring}`}>
                                <Icon className="w-10 h-10" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 text-center pt-10">
                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">{title}</h3>
                            <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                {message}
                            </p>

                            <button
                                onClick={onClose}
                                className={`w-full py-4 ${config.button} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transform active:scale-95 transition-all outline-none`}
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
