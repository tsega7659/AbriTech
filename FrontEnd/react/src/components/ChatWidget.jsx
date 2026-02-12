import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Markdown renderer for AI responses
import ReactMarkdown from 'react-markdown';

// API Base URL - adjust based on your environment or props
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ChatWidget({ userRole = 'student' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        {
            role: 'model',
            parts: [{ text: "Hi! I'm your Abritech AI Assistant. How can I help you today?" }]
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            // Focus input when opened
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, chatHistory]);

    const handleSendMessage = async (e) => {
        e?.preventDefault();

        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage(''); // Clear input immediately

        // Optimistically update UI
        const newHistory = [
            ...chatHistory,
            { role: 'user', parts: [{ text: userMessage }] }
        ];
        setChatHistory(newHistory);
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };

            // Allow public chat if no token, or add auth if backend requires it
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const historyForBackend = newHistory.slice(0, -1)
                .filter((_, index) => index !== 0) // Remove the initial greeting
                .map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.parts[0].text }]
                }));

            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message: userMessage,
                    history: historyForBackend
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            setChatHistory(prev => [
                ...prev,
                { role: 'model', parts: [{ text: data.response }] }
            ]);
        } catch (error) {
            console.error('Chat error:', error);
            setChatHistory(prev => [
                ...prev,
                { role: 'model', parts: [{ text: "I'm having trouble connecting right now. Please try again later." }] }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans leading-relaxed">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className={`bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? 'w-[80vw] h-[80vh] md:w-[600px] md:h-[700px]' : 'w-[90vw] h-[500px] md:w-[400px]'
                            }`}
                    >
                        {/* Header */}
                        <div className="bg-[#00B4D8] p-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3 text-white">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">AbriTech AI</h3>
                                    <p className="text-blue-100 text-xs font-medium">Always here to help</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden md:block"
                                    title={isExpanded ? "Minimize" : "Expand"}
                                >
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
                            {chatHistory.map((msg, idx) => {
                                const isUser = msg.role === 'user';
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={idx}
                                        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isUser ? 'bg-gray-200' : 'bg-[#00B4D8]'
                                            }`}>
                                            {isUser ?
                                                <User className="w-4 h-4 text-gray-600" /> :
                                                <Bot className="w-5 h-5 text-white" />
                                            }
                                        </div>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm ${isUser
                                            ? 'bg-white text-gray-800 border border-gray-100 rounded-tr-none'
                                            : 'bg-[#00B4D8]/10 text-gray-800 border border-[#00B4D8]/10 rounded-tl-none'
                                            }`}>
                                            {isUser ? (
                                                <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                                            ) : (
                                                <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-a:text-blue-600">
                                                    <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#00B4D8] flex items-center justify-center shrink-0 shadow-sm">
                                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                                    </div>
                                    <div className="bg-[#00B4D8]/5 rounded-2xl rounded-tl-none px-4 py-3 border border-[#00B4D8]/10">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-[#00B4D8]/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-[#00B4D8]/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-[#00B4D8]/40 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                            <form
                                onSubmit={handleSendMessage}
                                className="flex items-end gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#00B4D8]/20 focus-within:border-[#00B4D8] transition-all"
                            >
                                <textarea
                                    ref={inputRef}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Ask me anything..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none max-h-32 text-sm p-2"
                                    rows={2}
                                    style={{ minHeight: '40px' }}
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isLoading}
                                    className="p-2 bg-[#00B4D8] text-white rounded-lg hover:bg-[#0096B4] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-100 hover:shadow-lg"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                            <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
                                AI can make mistakes. Consider checking important information.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg shadow-blue-200 flex items-center justify-center transition-all duration-300 z-50 ${isOpen
                    ? 'bg-gray-100 text-gray-600 rotate-90'
                    : 'bg-[#00B4D8] text-white hover:bg-[#0096B4]'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-7 h-7" />}
            </motion.button>
        </div>
    );
}
