import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function FeedbackModal({ isOpen, onClose, title, message, type = "success", errors = [] }) {
    const configs = {
        success: {
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-50/50",
            border: "border-emerald-100/50",
            glow: "bg-emerald-400/5"
        },
        error: {
            icon: AlertCircle,
            color: "text-rose-500",
            bg: "bg-rose-50/50",
            border: "border-rose-100/50",
            glow: "bg-rose-400/5"
        },
        warning: {
            icon: AlertCircle,
            color: "text-amber-500",
            bg: "bg-amber-50/50",
            border: "border-amber-100/50",
            glow: "bg-amber-400/5"
        },
        info: {
            icon: Info,
            color: "text-blue-500",
            bg: "bg-blue-50/50",
            border: "border-blue-100/50",
            glow: "bg-blue-400/5"
        }
    };

    const config = configs[type] || configs.success;
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-100/20 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        className="relative w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden z-10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-400 hover:bg-slate-50 rounded-full transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-10 pt-12 text-center">
                            <div className="relative mx-auto w-20 h-20 mb-8">
                                <div className={`absolute inset-0 ${config.glow} rounded-full blur-2xl`} />
                                <div className={`relative w-full h-full ${config.bg} ${config.border} border rounded-[2rem] flex items-center justify-center`}>
                                    <Icon className={`w-9 h-9 ${config.color}`} strokeWidth={1.5} />
                                </div>
                            </div>

                            <div className="text-center space-y-3 mb-6">
                                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                                    {title}
                                </h3>
                                <p className="text-slate-500 font-medium leading-relaxed text-[15px]">
                                    {message}
                                </p>
                            </div>

                            {errors.length > 0 && (
                                <div className="mt-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50 text-left">
                                    <ul className="space-y-2">
                                        {errors.map((err, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-rose-500/80">
                                                <span className="mt-1.5 flex-shrink-0 w-1 h-1 bg-rose-400 rounded-full" />
                                                <span className="leading-tight">{err}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-10">
                                <button
                                    onClick={onClose}
                                    className="w-full py-4.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-[1.5rem] font-bold text-sm transition-all active:scale-[0.98] border border-slate-100"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
