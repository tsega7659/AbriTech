import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import QrCodeScannerModal from './QrCodeScannerModal';

/**
 * Normalizes and auto-formats input to ATK1-XXXX-XXXX
 */
export const formatActivationKey = (input) => {
    // Strip everything except alphanumeric
    const raw = (input || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Chunk into prefix (ATK1) and two 4-character blocks
    let formatted = '';
    for (let i = 0; i < raw.length && i < 12; i++) {
        if (i === 4 || i === 8) {
            formatted += '-';
        }
        formatted += raw[i];
    }
    return formatted;
};

export default function ActivationKeyModal({ isOpen, onClose, initialKey = '', onSuccess }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unlockedCourse, setUnlockedCourse] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setKey(formatActivationKey(initialKey));
            setError(null);
            setUnlockedCourse(null);
        }
    }, [isOpen, initialKey]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setKey(formatActivationKey(val));
        if (error) setError(null);
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            // Save key in session storage so student can redeem after logging in
            if (key) {
                sessionStorage.setItem('pending_activation_key', key);
            }
            navigate('/auth/login?redirect=/activate');
            return;
        }

        const rawClean = key.trim().toUpperCase();
        if (rawClean.length < 8) {
            setError('Please enter a complete activation key (e.g. ATK1-XXXX-XXXX)');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/kits/activate', { key: rawClean });
            const courseData = response.data?.course;
            setUnlockedCourse(courseData);
            
            // Clear pending key if any
            sessionStorage.removeItem('pending_activation_key');

            if (onSuccess) {
                onSuccess(courseData);
            }

            // Redirect to course learn page after short celebration
            setTimeout(() => {
                if (courseData?.id) {
                    navigate(`/dashboard/student/courses/${courseData.id}/learn`);
                }
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Redeem error:', err);
            const msg = err.response?.data?.message || 'Failed to activate key. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10"
                    >
                        {/* Header Banner */}
                        <div className="bg-gradient-to-br from-[#00B4D8] to-blue-600 p-6 text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                                <QrCode className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Redeem Physical Kit Key</h3>
                            <p className="text-blue-100 text-xs font-medium mt-1">
                                Enter the key from your kit packaging or card to immediately unlock full course access.
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {unlockedCourse ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-6 space-y-4"
                                >
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-gray-900">Kit Activated!</h4>
                                        <p className="text-sm font-semibold text-[#00B4D8] mt-1">
                                            {unlockedCourse.name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Redirecting you to your lessons now...
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <div className="h-1.5 w-32 bg-gray-100 rounded-full mx-auto overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleRedeem} className="space-y-5">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                                                Activation Key
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsScannerOpen(true)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B4D8] hover:text-[#0096B4] transition-colors bg-blue-50/80 px-2.5 py-1 rounded-lg"
                                            >
                                                <Camera className="w-3.5 h-3.5" /> Scan QR with Camera
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={key}
                                                onChange={handleInputChange}
                                                placeholder="ATK1-XXXX-XXXX"
                                                maxLength={14}
                                                autoFocus
                                                disabled={loading}
                                                className="w-full text-center font-mono text-xl tracking-widest font-black uppercase py-4 px-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl focus:bg-white focus:border-[#00B4D8] focus:outline-none transition-all placeholder:text-gray-300"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-1.5 text-center">
                                            Format: <span className="font-mono font-bold text-gray-500">ATK1-XXXX-XXXX</span> (Auto-formatted)
                                        </p>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2.5 text-rose-600 text-xs font-medium"
                                        >
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || key.length < 8}
                                        className="w-full bg-[#00B4D8] hover:bg-[#0096B4] disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Verifying Key...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Unlock Course</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>

                                    {!user && (
                                        <p className="text-center text-xs text-amber-600 bg-amber-50 py-2 px-3 rounded-xl font-medium">
                                            ℹ️ You'll be prompted to log in or sign up before finalizing activation.
                                        </p>
                                    )}
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            <QrCodeScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={(scannedKey) => {
                    setKey(scannedKey);
                    setError(null);
                }}
            />
        </AnimatePresence>
    );
}
