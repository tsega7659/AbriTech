import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link as LinkIcon, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSubmitAssignment } from '../hooks/useStudentQueries';

export default function ProjectSubmissionModal({ isOpen, onClose, assignment }) {
    const [formData, setFormData] = useState({
        textContent: '',
        githubLink: ''
    });
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);

    const submitMutation = useSubmitAssignment();

    // Reset all state whenever assignment changes while modal is open.
    // Also reset on open. This prevents old submitted text/file from lingering when students switch assignments.
    useEffect(() => {
        if (!isOpen) return;

        setFormData({ textContent: '', githubLink: '' });
        setFile(null);
        setUploadProgress(0);
        setIsSuccess(false);
        submitMutation.reset();
    }, [isOpen, assignment?.id]);


    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('textContent', formData.textContent);
        data.append('isFinal', 'true'); // Always submit as final (pending), not draft
        if (formData.githubLink) data.append('githubLink', formData.githubLink);
        if (file) data.append('file', file);

        try {
            await submitMutation.mutateAsync({
                assignmentId: assignment.id,
                formData: data,
                onProgress: (progress) => setUploadProgress(progress)
            });
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 3000);
        } catch (error) {
            console.error("Submission failed:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Submit Project</h2>
                                <p className="text-sm text-gray-500 font-medium">{assignment?.title}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-20 flex flex-col items-center text-center space-y-4"
                            >
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900">Successfully Submitted!</h3>
                                <p className="text-gray-500 max-w-xs mx-auto font-medium">Your project has been sent to your instructor for review.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Additional Notes</label>
                                    <textarea
                                        value={formData.textContent}
                                        onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}

                                        placeholder="Add any context or notes for the instructor..."
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-[#00B4D8] focus:bg-white text-gray-900 text-sm font-medium focus:outline-none transition-all h-32 resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">GitHub / Demo URL (Optional)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="url"
                                            value={formData.githubLink}
                                            onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                                            placeholder="https://github.com/..."
                                            className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-[#00B4D8] focus:bg-white text-gray-900 text-sm font-medium focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Project Files</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="project-file"
                                        />
                                        <label
                                            htmlFor="project-file"
                                            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-8 hover:border-[#00B4D8]/50 hover:bg-blue-50/50 transition-all cursor-pointer group"
                                        >
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <Upload className="h-6 w-6 text-[#00B4D8]" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{file ? file.name : "Choose files or drag & drop"}</span>
                                            <span className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">PDF, ZIP, or Documentation</span>
                                        </label>
                                    </div>
                                </div>

                                {submitMutation.isPending && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#00B4D8]">
                                            <span>Uploading Project</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${uploadProgress}%` }}
                                                className="h-full bg-[#00B4D8] rounded-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {submitMutation.isError && (
                                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <p className="text-xs font-bold text-red-600">{submitMutation.error?.response?.data?.message || "Failed to submit project. Please try again."}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitMutation.isPending}
                                    className="w-full py-5 bg-[#00B4D8] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-[#0096B4] hover:shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {submitMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Finish Submission
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
