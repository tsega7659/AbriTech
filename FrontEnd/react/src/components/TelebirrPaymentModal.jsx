import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Smartphone, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import apiClient from '../lib/apiClient';

export default function TelebirrPaymentModal({ isOpen, onClose, courseId, onSuccess }) {
    const [step, setStep] = useState('input');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [course, setCourse] = useState(null);
    const [loadingCourse, setLoadingCourse] = useState(true);

    useEffect(() => {
        if (isOpen && courseId) {
            setStep('input');
            setPhoneNumber('');
            setErrorMsg('');
            setLoadingCourse(true);

            apiClient.get('/courses')
                .then((res) => {
                    const list = Array.isArray(res.data) ? res.data : [];
                    const c = list.find((item) => item.id === parseInt(courseId, 10));
                    setCourse(c);
                    setLoadingCourse(false);
                })
                .catch(() => {
                    setErrorMsg('Could not load course details.');
                    setLoadingCourse(false);
                });
        }
    }, [isOpen, courseId]);

    const handlePayment = async () => {
        if (!phoneNumber) {
            setErrorMsg('Enter your phone number.');
            return;
        }
        if (!/^(09|07)\d{8}$/.test(phoneNumber)) {
            setErrorMsg('Use a valid number (e.g. 0912345678).');
            return;
        }

        setStep('processing');
        setErrorMsg('');

        try {
            const res = await apiClient.post('/payments/telebirr', { courseId, phoneNumber });
            if (res.data.success) {
                setStep('success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                setStep('error');
                setErrorMsg(res.data.message || 'Payment failed.');
            }
        } catch (error) {
            setStep('error');
            setErrorMsg(error.response?.data?.message || 'Payment failed. Try again.');
        }
    };

    if (!isOpen) return null;

    const price = course?.hasDiscount ? course.discountPrice : course?.price;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/10 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden z-10"
                >
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                    <Smartphone className="w-5 h-5 text-slate-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Telebirr</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {loadingCourse ? (
                            <div className="py-12 flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                                <p className="text-sm font-medium text-slate-400">Loading course...</p>
                            </div>
                        ) : (
                            <div className="min-h-[300px] flex flex-col justify-between">
                                {step === 'input' && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Course Details</p>
                                            <p className="text-sm font-semibold text-slate-900 line-clamp-1">{course?.name}</p>
                                            <p className="text-xl font-black text-slate-900 mt-2">{price} ETB</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="0912345678"
                                                    maxLength={10}
                                                    className={`w-full px-5 py-4 rounded-2xl bg-white border ${errorMsg ? 'border-rose-200 focus:border-rose-400' : 'border-slate-100 focus:border-slate-300'} text-slate-900 text-base font-medium focus:outline-none transition-all shadow-sm`}
                                                />
                                                {errorMsg && (
                                                    <motion.p 
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-2 text-xs font-medium text-rose-500 ml-1"
                                                    >
                                                        {errorMsg}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePayment}
                                            className="w-full py-4.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group"
                                        >
                                            Pay Now
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </motion.div>
                                )}

                                {step === 'processing' && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-12 flex flex-col items-center text-center space-y-6"
                                    >
                                        <div className="relative">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-blue-400 rounded-full blur-2xl"
                                            />
                                            <div className="relative w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center">
                                                <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-lg font-bold text-slate-900">Confirm Payment</p>
                                            <p className="text-sm text-slate-500 font-medium">Check your phone and enter your Telebirr PIN to complete the transaction.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'success' && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-12 flex flex-col items-center text-center space-y-6"
                                    >
                                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center">
                                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xl font-black text-slate-900">Payment Confirmed</p>
                                            <p className="text-sm text-slate-500 font-medium">Redirecting you to your course...</p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'error' && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-12 flex flex-col items-center text-center space-y-6"
                                    >
                                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center">
                                            <AlertCircle className="w-10 h-10 text-rose-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-lg font-bold text-slate-900">Transaction Failed</p>
                                            <p className="text-sm text-rose-500 font-medium">{errorMsg}</p>
                                        </div>
                                        <button
                                            onClick={() => { setStep('input'); setErrorMsg(''); }}
                                            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold text-xs transition-all uppercase tracking-wider"
                                        >
                                            Try Again
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
