import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, AlertCircle, RefreshCw, Sparkles, SwitchCamera } from 'lucide-react';
import { formatActivationKey } from './ActivationKeyModal';

export default function QrCodeScannerModal({ isOpen, onClose, onScanSuccess }) {
    const [cameraError, setCameraError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);
    const readerElementId = 'html5-qr-reader-viewport';

    useEffect(() => {
        if (!isOpen) return;

        let html5QrCode = null;

        const startScanner = async () => {
            setCameraError(null);
            setIsScanning(true);

            try {
                // Ensure DOM element is mounted
                await new Promise((r) => setTimeout(r, 100));

                html5QrCode = new Html5Qrcode(readerElementId);
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                };

                await html5QrCode.start(
                    { facingMode: 'environment' }, // Prefer rear camera on mobile
                    config,
                    (decodedText) => {
                        // Success callback
                        handleDecodedContent(decodedText, html5QrCode);
                    },
                    (errorMessage) => {
                        // Non-critical scan failure (continuous frame searching)
                    }
                );
            } catch (err) {
                console.error('Failed to start camera scanner:', err);
                setCameraError(
                    err?.message || 'Unable to access your camera. Please check camera permissions or enter your key manually.'
                );
                setIsScanning(false);
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current) {
                scannerRef.current
                    .stop()
                    .then(() => scannerRef.current.clear())
                    .catch((err) => console.warn('Camera stop error:', err));
            }
        };
    }, [isOpen]);

    const handleDecodedContent = (decodedText, scannerInstance) => {
        // Parse code if it's a URL (e.g. https://.../activate?code=ATK1-XXXX-XXXX)
        let extractedKey = decodedText;
        try {
            if (decodedText.includes('code=')) {
                const url = new URL(decodedText);
                extractedKey = url.searchParams.get('code') || decodedText;
            } else if (decodedText.includes('/activate/')) {
                const parts = decodedText.split('/activate/');
                extractedKey = parts[1] || decodedText;
            }
        } catch {
            // Not a URL, use raw string
        }

        const formatted = formatActivationKey(extractedKey);

        // Stop scanner immediately
        if (scannerInstance) {
            scannerInstance
                .stop()
                .then(() => scannerInstance.clear())
                .catch((e) => console.warn(e));
        }

        onScanSuccess(formatted);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 rounded-2xl bg-[#00B4D8]/20 flex items-center justify-center text-[#00B4D8] mb-2">
                                <Camera className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Scan Kit QR Code</h3>
                            <p className="text-xs text-slate-300 mt-1">
                                Point your camera at the QR code sticker on your kit packaging or card.
                            </p>
                        </div>

                        {/* Scanner Viewport */}
                        <div className="p-6 space-y-4">
                            {cameraError ? (
                                <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 text-center space-y-3">
                                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                                    <h4 className="text-sm font-bold text-rose-900">Camera Access Error</h4>
                                    <p className="text-xs text-rose-600 leading-relaxed">
                                        {cameraError}
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="mt-2 px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl"
                                    >
                                        Enter Key Manually
                                    </button>
                                </div>
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square flex items-center justify-center shadow-inner">
                                    <div id={readerElementId} className="w-full h-full"></div>

                                    {/* Animated Target Reticle Overlay */}
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="w-60 h-60 border-2 border-[#00B4D8] rounded-2xl relative">
                                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white -mt-1 -ml-1"></div>
                                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white -mt-1 -mr-1"></div>
                                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white -mb-1 -ml-1"></div>
                                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white -mb-1 -mr-1"></div>
                                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#00B4D8]/80 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-center text-xs text-slate-400 font-medium">
                                Hold steady inside the blue frame. Detection is automatic.
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all"
                            >
                                Cancel & Type Key Manually
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
