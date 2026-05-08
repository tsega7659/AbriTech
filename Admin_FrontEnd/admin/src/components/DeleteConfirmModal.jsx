import React from 'react';
import { AlertTriangle, X, Loader2, AlertCircle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, itemName, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl shadow-rose-900/10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-slate-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient pattern */}
                <div className="relative h-32 bg-gradient-to-br from-rose-50 to-red-50 flex items-center justify-center overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-100/50 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-100/50 rounded-full blur-2xl"></div>
                    
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="absolute top-4 right-4 p-2 text-rose-400 hover:text-rose-600 hover:bg-white/80 rounded-xl transition-all z-10 disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    {/* Icon Container with pulse effect */}
                    <div className="relative z-10 mt-8">
                        <div className="absolute inset-0 bg-rose-200 rounded-full animate-ping opacity-20"></div>
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-rose-200/50 flex items-center justify-center text-rose-500 ring-4 ring-rose-50 rotate-3 transition-transform hover:rotate-0">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 pt-12 pb-8 text-center relative bg-white">
                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                        {title || 'Confirm Deletion'}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6 px-2">
                        {message || 'Are you sure you want to delete this item? This action cannot be undone and will permanently remove all associated data.'}
                    </p>

                    {itemName && (
                        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100/80 mb-8 inline-block min-w-[80%]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                Target Item
                            </p>
                            <p className="font-bold text-slate-800 truncate px-4">{itemName}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 hover:text-slate-800 active:scale-95 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-[1.5] py-4 bg-rose-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-2xl" />
                            <span className="relative flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    'Yes, Delete It'
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
