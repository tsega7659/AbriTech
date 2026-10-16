import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, BookOpen, KeyRound, Camera } from 'lucide-react';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { formatActivationKey } from '../components/ActivationKeyModal';
import QrCodeScannerModal from '../components/QrCodeScannerModal';

export default function ActivateKitPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Check query param or sessionStorage
    const queryCode = searchParams.get('code') || '';
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successCourse, setSuccessCourse] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        const initial = queryCode || sessionStorage.getItem('pending_activation_key') || '';
        if (initial) {
            setKey(formatActivationKey(initial));
        }
    }, [queryCode]);

    const handleActivate = async (e) => {
        if (e) e.preventDefault();
        setError(null);

        if (!user) {
            if (key) {
                sessionStorage.setItem('pending_activation_key', key);
            }
            navigate(`/auth/login?redirect=${encodeURIComponent('/activate' + (key ? `?code=${key}` : ''))}`);
            return;
        }

        const rawClean = key.trim().toUpperCase();
        if (rawClean.length < 8) {
            setError('Please enter a valid activation key (e.g. ATK1-XXXX-XXXX)');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/kits/activate', { key: rawClean });
            const courseData = response.data?.course;
            setSuccessCourse(courseData);
            sessionStorage.removeItem('pending_activation_key');

            // Optional auto-redirect after 3 seconds
            setTimeout(() => {
                if (courseData?.id) {
                    navigate(`/dashboard/student/courses/${courseData.id}/learn`);
                }
            }, 3000);
        } catch (err) {
            console.error('Activation error:', err);
            const msg = err.response?.data?.message || 'Failed to activate key. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 bg-gradient-to-b from-blue-50/40 via-white to-gray-50/50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sm:p-12 relative overflow-hidden"
            >
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#00B4D8]/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header Icon */}
                <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#00B4D8] mb-6 shadow-sm">
                    <QrCode className="w-8 h-8" />
                </div>

                {successCourse ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4 space-y-6"
                    >
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div>
                            <span className="bg-emerald-50 text-emerald-700 text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider">
                                Enrollment Complete
                            </span>
                            <h2 className="text-3xl font-black text-gray-900 mt-3 tracking-tight">
                                Kit Activated!
                            </h2>
                            <p className="text-gray-500 text-sm mt-2">
                                You now have full lifetime access to:
                            </p>
                            <p className="text-xl font-black text-[#00B4D8] mt-1">
                                {successCourse.name}
                            </p>
                        </div>

                        <div className="pt-2">
                            <Link
                                to={`/dashboard/student/courses/${successCourse.id}/learn`}
                                className="w-full inline-flex items-center justify-center gap-2 bg-[#00B4D8] hover:bg-[#0096B4] text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/20 transition-all uppercase tracking-wider text-xs hover:-translate-y-0.5"
                            >
                                <BookOpen className="w-4 h-4" /> Start Learning Now
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <div className="space-y-2 mb-8">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                Physical Kit Activation
                            </h1>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Enter the unique key printed on your physical hardware kit box or card to immediately unlock your online course.
                            </p>
                        </div>

                        {!user && (
                            <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-amber-900 text-xs flex items-start gap-3">
                                <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Account Required to Claim Key</p>
                                    <p className="text-amber-700 mt-0.5">
                                        Please sign in with your student account so we can link your course progress.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleActivate} className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                                        Activation Key
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsScannerOpen(true)}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B4D8] hover:text-[#0096B4] transition-colors bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100"
                                    >
                                        <Camera className="w-3.5 h-3.5" /> Scan QR with Camera
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={key}
                                        onChange={(e) => {
                                            setKey(formatActivationKey(e.target.value));
                                            if (error) setError(null);
                                        }}
                                        placeholder="ATK1-XXXX-XXXX"
                                        maxLength={14}
                                        disabled={loading}
                                        className="w-full text-center font-mono text-2xl tracking-widest font-black uppercase py-4 px-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl focus:bg-white focus:border-[#00B4D8] focus:outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <p className="text-[11px] text-gray-400 mt-2 text-center">
                                    Usually printed as 12 alphanumeric characters formatted with dashes.
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2.5 text-rose-600 text-xs font-medium"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || key.length < 8}
                                className="w-full bg-[#00B4D8] hover:bg-[#0096B4] disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Redeeming Key...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{user ? 'Activate Course Access' : 'Sign In & Activate'}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400 text-xs font-medium">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>One-time activation • Direct lifetime course access</span>
                        </div>
                    </>
                )}
            </motion.div>

            <QrCodeScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={(scannedKey) => {
                    setKey(scannedKey);
                    setError(null);
                }}
            />
        </div>
    );
}
