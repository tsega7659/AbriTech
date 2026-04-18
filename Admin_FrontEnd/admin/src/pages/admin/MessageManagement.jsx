import React, { useState, useEffect } from 'react';
import {
    Mail,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    Eye,
    Reply,
    Search,
    Filter,
    X,
    Send,
    Loader2,
    ArrowRight
} from 'lucide-react';
import apiClient from '../../lib/apiClient';
import FeedbackModal from '../../components/FeedbackModal';
import Loading from '../../components/Loading';

const MessageManagement = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ show: false, title: "", message: "", type: "success" });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/contact/admin/messages');
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            showFeedback('Error', 'Failed to fetch messages.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (title, message, type) => {
        setFeedback({ show: true, title, message, type });
    };

    const handleToggleStatus = async (message) => {
        const newStatus = message.status === 'pending' ? 'reviewed' : 'pending';
        try {
            await apiClient.patch(`/contact/admin/messages/${message.id}/status`, { status: newStatus });
            setMessages(prev => prev.map(m => m.id === message.id ? { ...m, status: newStatus } : m));
            if (selectedMessage?.id === message.id) {
                setSelectedMessage({ ...selectedMessage, status: newStatus });
            }
        } catch (error) {
            showFeedback('Error', 'Failed to update status.', 'error');
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setIsSubmitting(true);
        try {
            await apiClient.post(`/contact/admin/messages/${selectedMessage.id}/reply`, { replyMessage: replyText });
            showFeedback('Success', 'Reply sent successfully via email.', 'success');
            setIsReplyModalOpen(false);
            setReplyText('');
            // Refresh to get updated status and reply data
            fetchMessages();
        } catch (error) {
            showFeedback('Error', error.response?.data?.message || 'Failed to send reply.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredMessages = messages.filter(m => {
        const matchesSearch = (
            `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.message.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <FeedbackModal
                isOpen={feedback.show}
                onClose={() => setFeedback(prev => ({ ...prev, show: false }))}
                {...feedback}
            />

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        User Messages <MessageSquare className="w-8 h-8 text-primary" />
                    </h1>
                    <p className="text-slate-500 font-medium">Review and respond to inquiries from the public contact form.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-slate-400 hover:text-primary'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-105' : 'text-slate-400 hover:text-amber-500'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilterStatus('reviewed')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === 'reviewed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105' : 'text-slate-400 hover:text-emerald-500'}`}
                    >
                        Reviewed
                    </button>
                </div>
            </div>

            {/* Stats and Search Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        
                        <input
                            type="text"
                            placeholder=" Search messages, names or emails..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-600"
                        />
                    </div>
                </div>

                <div className="bg-[#00B4D8] rounded-2xl p-6 text-white shadow-xl shadow-primary/20 flex items-center justify-between">
                    <div >
                        <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">Unread Inquiries</p>
                        <h3 className="text-3xl font-black">{messages.filter(m => m.status === 'pending').length}</h3>
                    </div>
                </div>
            </div>

            {/* Messages Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Sender</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Excerpt</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Date</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5">
                                        <Loading fullScreen={false} message="Fetching messages..." />
                                    </td>
                                </tr>
                            ) : filteredMessages.length > 0 ? (
                                filteredMessages.map((msg) => (
                                    <tr
                                        key={msg.id}
                                        onClick={() => { setSelectedMessage(msg); setIsViewModalOpen(true); }}
                                        className="hover:bg-slate-50/80 transition-all group cursor-pointer border-b border-slate-50 last:border-0"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs shadow-sm">
                                                    {msg.firstName.charAt(0)}{msg.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700">{msg.firstName} {msg.lastName}</p>
                                                    <p className="text-xs font-medium text-slate-400">{msg.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-xs">
                                            <p className="text-sm font-medium text-slate-500 truncate">{msg.message}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => handleToggleStatus(msg)}
                                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${msg.status === 'reviewed'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                    }`}
                                            >
                                                {msg.status === 'reviewed' ? (
                                                    <><CheckCircle2 className="w-3 h-3" /> Reviewed</>
                                                ) : (
                                                    <><AlertCircle className="w-3 h-3" /> Pending</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedMessage(msg); setIsViewModalOpen(true); }}
                                                    className="p-2 hover:bg-white hover:text-primary hover:shadow-md rounded-lg transition-all text-slate-400 border border-transparent hover:border-slate-100"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedMessage(msg); setIsReplyModalOpen(true); }}
                                                    className="p-2 hover:bg-white hover:text-emerald-500 hover:shadow-md rounded-lg transition-all text-slate-400 border border-transparent hover:border-slate-100"
                                                >
                                                    <Reply className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center space-y-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                            <MessageSquare className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No messages found matching your criteria</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {isViewModalOpen && selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsViewModalOpen(false)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 shadow-2xl">
                        <button onClick={() => setIsViewModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600 z-10">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-8 md:p-12 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-inner">
                                    {selectedMessage.firstName.charAt(0)}{selectedMessage.lastName.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">{selectedMessage.firstName} {selectedMessage.lastName}</h2>
                                    <p className="text-slate-500 font-medium flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> {selectedMessage.email}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                        <span>Inquiry Date</span>
                                        <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all group-hover:shadow-md">
                                        <p className="text-slate-700 leading-relaxed font-medium text-lg">
                                            {selectedMessage.message}
                                        </p>
                                    </div>
                                </div>

                                {selectedMessage.replyMessage && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100/50">
                                            <span>Sent Reply</span>
                                            <span>{new Date(selectedMessage.repliedAt).toLocaleString()}</span>
                                        </div>
                                        <div className="p-6 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                                            <p className="text-emerald-700 leading-relaxed font-medium">
                                                {selectedMessage.replyMessage}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        onClick={() => handleToggleStatus(selectedMessage)}
                                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedMessage.status === 'reviewed'
                                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                            }`}
                                    >
                                        {selectedMessage.status === 'reviewed' ? 'Mark as Pending' : 'Mark as Reviewed'}
                                    </button>
                                    <button
                                        onClick={() => { setIsViewModalOpen(false); setIsReplyModalOpen(true); }}
                                        className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                                    >
                                        Reply via Email <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {isReplyModalOpen && selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsReplyModalOpen(false)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 shadow-2xl">
                        <button onClick={() => setIsReplyModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-primary">
                            <X className="w-6 h-6" />
                        </button>

                        <form onSubmit={handleReply} className="p-8 md:p-12 space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-800">Reply to {selectedMessage.firstName}</h2>
                                <p className="text-slate-500 font-medium">This reply will be sent directly to their email address.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Original Inquiry</label>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm italic text-slate-500">
                                        {selectedMessage.message.substring(0, 150)}{selectedMessage.message.length > 150 ? '...' : ''}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Draft Your Reply</label>
                                    <textarea
                                        rows={6}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-600 resize-none"
                                        placeholder="Type your reply here..."
                                        required
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !replyText.trim()}
                                className="w-full py-5 bg-[#00B4D8] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? (
                                    <>Sending... <Loader2 className="w-5 h-5 animate-spin" /></>
                                ) : (
                                    <>Send Reply via Email <Send className="w-5 h-5" /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageManagement;
