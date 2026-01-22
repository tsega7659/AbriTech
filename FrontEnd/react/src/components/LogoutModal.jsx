import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X, AlertTriangle } from "lucide-react";

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
                    >
                        {/* Header */}
                        <div className="bg-red-50 p-6 flex justify-center relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-red-300 hover:text-red-500 hover:bg-white/50 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-500 ring-4 ring-red-100/50">
                                <LogOut className="w-8 h-8 ml-1" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Log Out</h3>
                            <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                Are you sure you want to log out? You will need to sign in again to access your dashboard.
                            </p>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3.5 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="px-6 py-3.5 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-600 hover:shadow-red-300 transform active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Log Out</span>
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
