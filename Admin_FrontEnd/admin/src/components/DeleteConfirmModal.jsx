import React from 'react';
import { AlertTriangle, X, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, itemName, loading }) => {
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
                            disabled={loading}
                            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-400 hover:bg-slate-50 rounded-full transition-all z-10 disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-10 pt-12 text-center">
                            <div className="relative mx-auto w-20 h-20 mb-8">
                                <div className="absolute inset-0 bg-rose-400/5 rounded-full blur-2xl" />
                                <div className="relative w-full h-full bg-rose-50/50 border border-rose-100/50 rounded-[2rem] flex items-center justify-center text-rose-500">
                                    <Trash2 className="w-9 h-9" strokeWidth={1.5} />
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                                    {title || 'Confirm Deletion'}
                                </h3>
                                <p className="text-slate-500 font-medium text-[15px] leading-relaxed">
                                    {message || 'Are you sure you want to delete this item? This action is permanent and cannot be undone.'}
                                </p>
                            </div>

                            {itemName && (
                                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50 mb-10">
                                    <div className="flex items-center justify-center gap-1.5 mb-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" strokeWidth={2.5} />
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Target Item</span>
                                    </div>
                                    <p className="font-bold text-slate-800 text-sm truncate px-2">{itemName}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className="w-full py-4.5 bg-rose-500 hover:bg-rose-600 text-white rounded-[1.5rem] font-bold text-sm shadow-[0_10px_25px_rgba(244,63,94,0.15)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        'Confirm Deletion'
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="w-full py-4.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-[1.5rem] font-bold text-sm transition-all active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteConfirmModal;
