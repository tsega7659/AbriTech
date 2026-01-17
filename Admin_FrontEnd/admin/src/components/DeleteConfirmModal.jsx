import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, itemName, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl shadow-slate-900/20 animate-in zoom-in-95 duration-200 border border-slate-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header/Icon */}
                <div className="h-24 bg-rose-50 flex items-center justify-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-rose-300 hover:text-rose-500 hover:bg-white rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500 ring-4 ring-rose-50">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h3 className="text-xl font-black text-slate-800 mb-2">{title || 'Confirm Deletion'}</h3>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed mb-6">
                        {message || 'Are you sure you want to delete this item? This action cannot be undone and will permanently remove all associated data.'}
                    </p>

                    {itemName && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deleting</p>
                            <p className="font-black text-slate-700 truncate">{itemName}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:shadow-rose-500/30 hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Confirm Delete'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
