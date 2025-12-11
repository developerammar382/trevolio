'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMessageCircle, FiSend, FiUser, FiClock, FiSmile, FiPaperclip, FiX } from 'react-icons/fi';
import api from '@/lib/api';
import { getEcho } from '@/lib/echo';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
    is_read: boolean;
    sender: {
        id: number;
        name: string;
    };
}

interface Conversation {
    id: number;
    user_id: number;
    admin_id: number | null;
    status: 'open' | 'closed' | 'waiting';
    last_message_at: string;
    user_typing: boolean;
    unread_count?: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    admin?: {
        id: number;
        name: string;
    };
    messages?: Message[];
}

export default function AdminChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'open' | 'closed'>('all');
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const statusFilterRef = useRef(statusFilter);
    const lastFetchRef = useRef(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update ref when status filter changes
    useEffect(() => {
        statusFilterRef.current = statusFilter;
    }, [statusFilter]);

    const fetchConversations = useCallback(async () => {
        // Rate limiting to prevent infinite loops
        const now = Date.now();
        if (now - lastFetchRef.current < 1000) {
            console.warn('⚠️ fetchConversations throttled (called too frequently)');
            return;
        }
        lastFetchRef.current = now;

        console.log('🔄 Fetching conversations with status:', statusFilterRef.current);

        try {
            const res = await api.get('/admin/chat/conversations', {
                params: { status: statusFilterRef.current },
            });
            setConversations(res.data.conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    }, []); // Empty dependency array as we use refs

    // Initial fetch and status filter change
    useEffect(() => {
        fetchConversations();
    }, [statusFilter, fetchConversations]);

    // WebSocket listener for admin chat channel (conversation list updates)
    useEffect(() => {
        try {
            const echo = getEcho();
            const channel = echo.private('admin.chat');

            console.log('📡 Subscribing to admin.chat');

            const handleUpdate = (e: any) => {
                console.log('🔔 ConversationUpdated event received:', e);
                fetchConversations();
            };

            channel.listen('ConversationUpdated', handleUpdate);
            channel.listen('.ConversationUpdated', handleUpdate);
            channel.listen('App\\Events\\ConversationUpdated', handleUpdate);
            return () => {
                console.log('🔌 Unsubscribing from admin.chat');
                channel.stopListening('ConversationUpdated');
                echo.leave('admin.chat');
            };
        } catch (error) {
            console.error('❌ Error setting up admin WebSocket:', error);
        }
    }, [fetchConversations]);

    // WebSocket listener for selected conversation
    useEffect(() => {
        if (!selectedConversation) return;

        try {
            const echo = getEcho();
            const channel = echo.private(`chat.${selectedConversation.id}`);

            console.log('📡 Subscribing to chat:', selectedConversation.id);

            // Listen for new messages
            const handleMessage = (e: any) => {
                console.log('📨 MessageSent received:', e);
                setSelectedConversation(prev => {
                    if (!prev) return prev;
                    // Avoid duplicates
                    if (prev.messages?.some(m => m.id === e.message.id)) return prev;

                    return {
                        ...prev,
                        messages: [...(prev.messages || []), e.message]
                    };
                });
                markAsRead(selectedConversation.id);
            };

            channel.listen('MessageSent', handleMessage);
            channel.listen('.MessageSent', handleMessage);
            channel.listen('App\\Events\\MessageSent', handleMessage);

            // Listen for typing indicators
            const handleTyping = (e: any) => {
                if (e.userType === 'customer') {
                    setSelectedConversation(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            user_typing: e.isTyping
                        };
                    });
                }
            };

            channel.listen('UserTyping', handleTyping);
            channel.listen('.UserTyping', handleTyping);
            channel.listen('App\\Events\\UserTyping', handleTyping);

            return () => {
                console.log('🔌 Unsubscribing from chat:', selectedConversation.id);
                channel.stopListening('MessageSent');
                channel.stopListening('UserTyping');
                echo.leave(`chat.${selectedConversation.id}`);
            };
        } catch (error) {
            console.error('❌ Error setting up chat WebSocket:', error);
        }
    }, [selectedConversation?.id]);

    // Mark as read when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            markAsRead(selectedConversation.id);
        }
    }, [selectedConversation?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversationDetails = async (id: number) => {
        try {
            const res = await api.get(`/admin/chat/conversations/${id}`);
            setSelectedConversation(res.data.conversation);
            markAsRead(id);
        } catch (error) {
            console.error('Error fetching conversation details:', error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/admin/chat/conversations/${id}/mark-read`);
            setConversations(prev => prev.map(c => {
                if (c.id === id) {
                    return { ...c, unread_count: 0 };
                }
                return c;
            }));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!message.trim() && !selectedFile) || !selectedConversation) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('conversation_id', selectedConversation.id.toString());
            if (message.trim()) {
                formData.append('message', message.trim());
            }
            if (selectedFile) {
                formData.append('media', selectedFile);
            }

            await api.post('/admin/chat/messages', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage('');
            setSelectedFile(null);
            setFilePreview(null);
            setShowEmojiPicker(false);
            updateTypingStatus(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send message');
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
        if (!selectedConversation) return;
        try {
            await api.post('/admin/chat/typing', {
                conversation_id: selectedConversation.id,
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

    const assignToMe = async (id: number) => {
        try {
            await api.post(`/admin/chat/conversations/${id}/assign`);
            toast.success('Conversation assigned to you');
            fetchConversationDetails(id);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to assign conversation');
        }
    };

    const closeConversation = async (id: number) => {
        try {
            await api.post(`/admin/chat/conversations/${id}/close`);
            toast.success('Conversation closed');
            setSelectedConversation(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to close conversation');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-700';
            case 'waiting':
                return 'bg-yellow-100 text-yellow-700';
            case 'closed':
                return 'bg-slate-100 text-slate-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const waitingCount = conversations.filter(c => c.status === 'waiting').length;
    const openCount = conversations.filter(c => c.status === 'open').length;

    return (
        <div className="h-[calc(100vh-4rem)] flex">
            {/* Sidebar - Conversations List */}
            <div className="w-96 border-r border-border flex flex-col bg-white">
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <FiMessageCircle className="w-6 h-6" />
                        Live Chat
                    </h2>
                    <div className="flex gap-2 mt-4">
                        {[
                            { label: 'All', value: 'all' },
                            { label: `Waiting (${waitingCount})`, value: 'waiting' },
                            { label: `Open (${openCount})`, value: 'open' },
                            { label: 'Closed', value: 'closed' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setStatusFilter(tab.value as any)}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                    statusFilter === tab.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <FiMessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No conversations</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => fetchConversationDetails(conv.id)}
                                className={cn(
                                    'w-full p-4 border-b border-border hover:bg-accent transition-colors text-left',
                                    selectedConversation?.id === conv.id && 'bg-accent'
                                )}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            <FiUser className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{conv.user.name}</p>
                                            <p className="text-xs text-muted-foreground">{conv.user.email}</p>
                                        </div>
                                    </div>
                                    {conv.unread_count && conv.unread_count > 0 && (
                                        <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(conv.status))}>
                                        {conv.status}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <FiClock className="w-3 h-3" />
                                        {format(new Date(conv.last_message_at), 'MMM d, HH:mm')}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <FiUser className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{selectedConversation.user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedConversation.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedConversation.status === 'waiting' && (
                                    <button
                                        onClick={() => assignToMe(selectedConversation.id)}
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                    >
                                        Assign to Me
                                    </button>
                                )}
                                {selectedConversation.status !== 'closed' && (
                                    <button
                                        onClick={() => closeConversation(selectedConversation.id)}
                                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                                    >
                                        Close Chat
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedConversation.messages?.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender_type === 'admin'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-white border border-border'
                                            }`}
                                    >
                                        {msg.sender_type === 'customer' && (
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
                                        <p className={`text-xs mt-1 ${msg.sender_type === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {format(new Date(msg.created_at), 'HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {selectedConversation.user_typing && (
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
                        {selectedConversation.status !== 'closed' && (
                            <form onSubmit={sendMessage} className="p-4 border-t border-border bg-white relative">
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
                                        className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || (!message.trim() && !selectedFile)}
                                        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        <FiSend className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <FiMessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Select a conversation to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
