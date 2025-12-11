'use client';

import { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiX, FiSend, FiSmile, FiPaperclip, FiImage, FiVideo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getEcho } from '@/lib/echo';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface Message {
    id: number;
    sender_id: number;
    sender_type: 'customer' | 'admin';
    message: string;
    media_url?: string | null;
    media_type?: 'image' | 'video' | null;
    created_at: string;
    sender: {
        id: number;
        name: string;
    };
}

interface Conversation {
    id: number;
    status: string;
    admin_typing: boolean;
    messages: Message[];
}

export default function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const isOpenRef = useRef(isOpen);

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch conversation when widget opens
    // Fetch conversation on mount to subscribe to channel
    useEffect(() => {
        if (user) {
            fetchConversation();
        }
    }, [user]);

    // WebSocket listeners for real-time updates
    useEffect(() => {
        if (!conversation || !user) return;

        try {
            const echo = getEcho();
            const channel = echo.private(`chat.${conversation.id}`);

            console.log('📡 Subscribing to channel:', `chat.${conversation.id}`);

            // Listen for new messages (try both with and without namespace)
            const handleMessage = (e: any) => {
                console.log('📨 New message received:', e);
                setConversation(prev => {
                    if (!prev) return prev;
                    // Avoid duplicates
                    if (prev.messages.some(m => m.id === e.message.id)) return prev;

                    return {
                        ...prev,
                        messages: [...prev.messages, e.message]
                    };
                });
                if (isOpenRef.current) {
                    markAsRead();
                } else {
                    setUnreadCount(prev => prev + 1);
                }
            };

            channel.listen('MessageSent', handleMessage);
            channel.listen('.MessageSent', handleMessage);
            channel.listen('App\\Events\\MessageSent', handleMessage);

            // Listen for typing indicators
            const handleTyping = (e: any) => {
                console.log('⌨️ Typing status:', e);
                if (e.userType === 'admin') {
                    setConversation(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            admin_typing: e.isTyping
                        };
                    });
                }
            };

            channel.listen('UserTyping', handleTyping);
            channel.listen('.UserTyping', handleTyping);
            channel.listen('App\\Events\\UserTyping', handleTyping);

            return () => {
                console.log('🔌 Unsubscribing from channel:', `chat.${conversation.id}`);
                channel.stopListening('MessageSent');
                channel.stopListening('UserTyping');
                echo.leave(`chat.${conversation.id}`);
            };
        } catch (error) {
            console.error('❌ Error setting up WebSocket:', error);
        }
    }, [conversation?.id, user]);

    // Mark as read when widget opens
    useEffect(() => {
        if (isOpen && conversation) {
            markAsRead();
        }
    }, [isOpen, conversation?.id]);

    // Fetch unread count when closed (fallback polling every 30s)
    useEffect(() => {
        if (!user || isOpen) return;

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000); // Poll every 30 seconds as fallback

        fetchUnreadCount(); // Initial fetch
        return () => clearInterval(interval);
    }, [user, isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [conversation?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversation = async () => {
        try {
            const res = await api.get('/chat/conversation');
            setConversation(res.data.conversation);
            setUnreadCount(res.data.unread_count || 0);
            // Only mark as read if widget is open
            if (isOpen) {
                markAsRead();
            }
        } catch (error) {
            console.error('Error fetching conversation:', error);
            toast.error('Failed to load chat');
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/chat/unread-count');
            setUnreadCount(res.data.unread_count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async () => {
        if (!conversation) return;
        try {
            await api.post('/chat/mark-read', {
                conversation_id: conversation.id,
            });
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!message.trim() && !selectedFile) || !conversation) return;

        const messageText = message.trim();
        setMessage('');
        updateTypingStatus(false);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('conversation_id', conversation.id.toString());
            if (messageText) {
                formData.append('message', messageText);
            }
            if (selectedFile) {
                formData.append('media', selectedFile);
            }

            const res = await api.post('/chat/messages', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Clear file selection
            setSelectedFile(null);
            setFilePreview(null);
            setShowEmojiPicker(false);

            // Message will be added via WebSocket
        } catch (error: any) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            setMessage(messageText); // Restore message on error
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            toast.error('File size must be less than 50MB');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload an image or video.');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onEmojiClick = (emojiData: any) => {
        setMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const updateTypingStatus = async (typing: boolean) => {
        if (!conversation) return;
        try {
            await api.post('/chat/typing', {
                conversation_id: conversation.id,
                typing,
            });
        } catch (error) {
            console.error('Error updating typing status:', error);
        }
    };

    const handleTyping = (value: string) => {
        setMessage(value);

        if (!isTyping && value.length > 0) {
            setIsTyping(true);
            updateTypingStatus(true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            updateTypingStatus(false);
        }, 2000);
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-50"
                    >
                        <FiMessageCircle className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed inset-0 w-full h-full sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] sm:max-h-[calc(100vh-2rem)] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 border border-border"
                    >
                        {/* Header */}
                        <div className="bg-primary text-primary-foreground p-4 sm:rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                                    <FiMessageCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Live Chat</h3>
                                    <p className="text-xs opacity-90">
                                        {user ? (conversation?.status === 'open' ? 'Connected' : 'Waiting for support...') : 'Login Required'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {!user ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <FiMessageCircle className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Login to Chat</h3>
                                <p className="text-slate-500 mb-6">
                                    Please login to start a conversation with our support team.
                                </p>
                                <a
                                    href="/login"
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Login Now
                                </a>
                            </div>
                        ) : (
                            <>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                                    {conversation?.messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender_type === 'customer'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-white border border-border'
                                                    }`}
                                            >
                                                {msg.sender_type === 'admin' && (
                                                    <p className="text-xs font-medium text-primary mb-1">{msg.sender.name}</p>
                                                )}

                                                {/* Media Display */}
                                                {msg.media_url && (
                                                    <div className="mb-2">
                                                        {msg.media_type === 'image' ? (
                                                            <img
                                                                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${msg.media_url}`}
                                                                alt="Shared image"
                                                                className="rounded-lg max-w-full h-auto max-h-64 object-cover"
                                                            />
                                                        ) : msg.media_type === 'video' ? (
                                                            <video
                                                                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${msg.media_url}`}
                                                                controls
                                                                className="rounded-lg max-w-full h-auto max-h-64"
                                                            />
                                                        ) : null}
                                                    </div>
                                                )}

                                                {msg.message && <p className="text-sm">{msg.message}</p>}
                                                <p className={`text-xs mt-1 ${msg.sender_type === 'customer' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                    {format(new Date(msg.created_at), 'HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {conversation?.admin_typing && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-border rounded-2xl px-4 py-2">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={sendMessage} className="p-4 border-t border-border bg-white sm:rounded-b-2xl relative">
                                    {/* File Preview */}
                                    {filePreview && (
                                        <div className="mb-3 relative inline-block">
                                            <div className="relative">
                                                {selectedFile?.type.startsWith('image/') ? (
                                                    <img src={filePreview} alt="Preview" className="max-h-32 rounded-lg" />
                                                ) : (
                                                    <video src={filePreview} className="max-h-32 rounded-lg" />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={removeFile}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <FiX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Emoji Picker */}
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-full left-4 mb-2 z-10">
                                            <EmojiPicker onEmojiClick={onEmojiClick} />
                                        </div>
                                    )}

                                    <div className="flex gap-2 items-center">
                                        {/* Emoji Button */}
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="p-2 text-slate-600 hover:text-primary transition-colors"
                                        >
                                            <FiSmile className="w-5 h-5" />
                                        </button>

                                        {/* File Upload Button */}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 text-slate-600 hover:text-primary transition-colors"
                                        >
                                            <FiPaperclip className="w-5 h-5" />
                                        </button>

                                        {/* Hidden File Input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />

                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) => handleTyping(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            disabled={loading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || (!message.trim() && !selectedFile)}
                                            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiSend className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
