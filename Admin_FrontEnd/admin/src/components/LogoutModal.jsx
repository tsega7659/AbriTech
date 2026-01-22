import React from 'react';
import { LogOut, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl shadow-slate-900/20 animate-in zoom-in-95 duration-200 border border-slate-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header/Icon */}
                <div className="h-24 bg-red-50 flex items-center justify-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-red-300 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-500 ring-4 ring-red-50">
                        <LogOut className="w-8 h-8 ml-1" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h3 className="text-xl font-black text-slate-800 mb-2">Log Out</h3>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed mb-6">
                        Are you sure you want to log out? You will be returned to the login screen.
                    </p>

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
                            className="px-6 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 hover:shadow-red-500/30 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span>Log Out</span>
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
