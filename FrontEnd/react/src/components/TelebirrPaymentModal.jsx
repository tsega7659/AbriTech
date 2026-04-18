import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '../lib/apiClient';

export default function TelebirrPaymentModal({ isOpen, onClose, courseId, onSuccess }) {
    const [step, setStep] = useState('input'); // 'input', 'processing', 'success', 'error'
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
            
            // Fetch course details for pricing
            apiClient.get('/courses')
                .then(res => {
                    const c = res.data.find(c => c.id === parseInt(courseId));
                    setCourse(c);
                    setLoadingCourse(false);
                })
                .catch(err => {
                    console.error("Failed to fetch course details for payment", err);
                    setErrorMsg('Failed to load course details. Please try again.');
                    setLoadingCourse(false);
                });
        }
    }, [isOpen, courseId]);

    const handlePayment = async () => {
        if (!phoneNumber) {
            setErrorMsg('Please enter your phone number.');
            return;
        }

        if (!/^(09|07)\d{8}$/.test(phoneNumber)) {
            setErrorMsg('Please enter a valid Ethiopian phone number (e.g., 0912345678).');
            return;
        }

        setStep('processing');
        setErrorMsg('');

        try {
            const res = await apiClient.post('/payments/telebirr', {
                courseId,
                phoneNumber
            });

            if (res.data.success) {
                setStep('success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 3000);
            } else {
                setStep('error');
                setErrorMsg(res.data.message || 'Payment failed.');
            }
        } catch (error) {
            console.error(error);
            setStep('error');
            setErrorMsg(error.response?.data?.message || 'Payment failed. Please check your Telebirr balance or try again.');
        }
    };

    if (!isOpen) return null;

    const price = course?.hasDiscount ? course.discountPrice : course?.price;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-[#8cc63f] p-6 text-white text-center relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <h2 className="text-2xl font-black mb-1">Telebirr</h2>
                        <p className="text-white/80 font-medium text-sm">Secure Mobile Payment</p>
                    </div>

                    <div className="p-8 pb-10 flex flex-col items-center">
                        {loadingCourse ? (
                            <div className="py-10 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 text-[#8cc63f] animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Loading details...</p>
                            </div>
                        ) : step === 'input' ? (
                            <div className="w-full space-y-6">
                                <div className="text-center space-y-1 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Paying for</p>
                                    <h3 className="text-lg font-black text-gray-900 leading-tight">{course?.name}</h3>
                                    <p className="text-xl font-black text-[#8cc63f] mt-2">{price} ETB</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                            placeholder="0912..."
                                            maxLength={10}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-[#8cc63f] focus:ring-4 focus:ring-[#8cc63f]/10 outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                    {errorMsg && (
                                        <p className="text-rose-500 text-xs font-bold pl-2 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errorMsg}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handlePayment}
                                    className="w-full bg-[#8cc63f] hover:bg-[#7ebd34] active:scale-95 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#8cc63f]/30 transition-all flex items-center justify-center gap-2"
                                >
                                    Pay with Telebirr
                                </button>
                                <p className="text-[10px] text-gray-400 text-center font-bold px-4 leading-relaxed">
                                    You will receive a USSD prompt on your phone. Enter your PIN to confirm the payment.
                                </p>
                            </div>
                        ) : step === 'processing' ? (
                            <div className="py-8 w-full flex flex-col items-center justify-center space-y-6 text-center">
                                <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center relative shadow-inner">
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        className="absolute inset-0 rounded-[2rem] border-2 border-dashed border-[#8cc63f]/30"
                                    />
                                    <Smartphone className="w-10 h-10 text-[#8cc63f] animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-gray-900 leading-tight">Check your phone</h3>
                                    <p className="text-sm font-medium text-gray-500 max-w-[200px]">
                                        A payment request has been sent to <span className="font-bold text-gray-900">{phoneNumber}</span>. Enter your PIN to complete.
                                    </p>
                                </div>
                            </div>
                        ) : step === 'success' ? (
                            <div className="py-8 w-full flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in duration-300">
                                <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-500 shadow-inner">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900">Payment Success</h3>
                                    <p className="text-sm font-medium text-gray-500">Your course has been unlocked!</p>
                                </div>
                            </div>
                        ) : step === 'error' ? (
                            <div className="py-8 w-full flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in duration-300">
                                <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 shadow-inner">
                                    <AlertCircle className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-gray-900">Payment Failed</h3>
                                    <p className="text-sm font-medium text-rose-500">{errorMsg}</p>
                                </div>
                                <button
                                    onClick={() => { setStep('input'); setErrorMsg(''); }}
                                    className="px-6 py-3 bg-gray-100 font-bold text-gray-500 rounded-xl hover:bg-gray-200 transition-colors text-xs uppercase"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : null}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
