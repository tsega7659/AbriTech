import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link as LinkIcon, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSubmitAssignment } from '../hooks/useStudentQueries';

export default function ProjectSubmissionModal({ isOpen, onClose, assignment }) {
    const [formData, setFormData] = useState({
        textContent: '',
        githubLink: ''
    });
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [fileError, setFileError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);

    const submitMutation = useSubmitAssignment();

    // Reset all state whenever assignment changes while modal is open.
    // Also reset on open. This prevents old submitted text/file from lingering when students switch assignments.
    useEffect(() => {
        if (!isOpen) return;

        setFormData({ textContent: '', githubLink: '' });
        setFiles([]);
        setFileError('');
        setUploadProgress(0);
        setIsSuccess(false);
        submitMutation.reset();
    }, [isOpen, assignment?.id]);


    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        e.target.value = '';
        const combinedFiles = [...files];
        selectedFiles.forEach(selectedFile => {
            const isDuplicate = combinedFiles.some(file =>
                file.name === selectedFile.name &&
                file.size === selectedFile.size &&
                file.lastModified === selectedFile.lastModified
            );
            if (!isDuplicate) combinedFiles.push(selectedFile);
        });

        if (combinedFiles.length > 10) {
            setFileError('You can attach up to 10 files.');
            return;
        }

        setFileError('');
        setFiles(combinedFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('submissionContent', formData.textContent);
        data.append('isFinal', 'true'); // Always submit as final (pending), not draft
        if (formData.githubLink) data.append('githubLink', formData.githubLink);
        files.forEach(file => data.append('files', file));

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
            <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto p-3 sm:p-4">
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
                    className="relative my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2rem]"
                >
                    <div className="overflow-y-auto p-5 sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-gray-900">Submit Project</h2>
                                <p className="text-sm text-gray-500 font-medium">{assignment?.title}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {assignment?.description && (
                            <div className="mb-4 rounded-2xl bg-gray-50 p-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Assignment Description</h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
                            </div>
                        )}

                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center space-y-4 py-12 text-center"
                            >
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900">Successfully Submitted!</h3>
                                <p className="text-gray-500 max-w-xs mx-auto font-medium">Your project has been sent to your instructor for review.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Additional Notes</label>
                                    <textarea
                                        value={formData.textContent}
                                        onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}

                                        placeholder="Add any context or notes for the instructor..."
                                        className="h-24 w-full resize-none rounded-2xl border border-transparent bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 transition-all focus:border-[#00B4D8] focus:bg-white focus:outline-none sm:h-28"
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
                                            className="w-full rounded-2xl border border-transparent bg-gray-50 py-3 pl-12 pr-5 text-sm font-medium text-gray-900 transition-all focus:border-[#00B4D8] focus:bg-white focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Project Files</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="project-file"
                                            multiple
                                        />
                                        <label
                                            htmlFor="project-file"
                                            className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 p-5 transition-all hover:border-[#00B4D8]/50 hover:bg-blue-50/50"
                                        >
                                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 transition-transform group-hover:scale-110">
                                                <Upload className="h-5 w-5 text-[#00B4D8]" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">
                                                {files.length ? `${files.length} file${files.length === 1 ? '' : 's'} selected` : "Choose files"}
                                            </span>
                                            {files.length > 0 && (
                                                <span className="text-xs text-gray-500 mt-1 text-center">{files.map(file => file.name).join(', ')}</span>
                                            )}
                                            <span className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Up to 10 files: PDF, ZIP, or documentation</span>
                                        </label>
                                    </div>
                                    {files.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 rounded-xl border border-[#00B4D8]/20 px-4 py-2 text-sm font-bold text-[#00B4D8] hover:bg-blue-50"
                                        >
                                            <Upload className="h-4 w-4" /> Add file
                                        </button>
                                    )}
                                    {fileError && (
                                        <p role="alert" className="text-sm font-bold text-red-600">{fileError}</p>
                                    )}
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
                                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#00B4D8] py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-[#0096B4] hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50"
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
