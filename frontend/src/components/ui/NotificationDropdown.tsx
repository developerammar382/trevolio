'use client';

import { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { getEcho } from '@/lib/echo';

export default function NotificationDropdown() {
    const { token, user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [prevCount, setPrevCount] = useState(0);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                const newNotifications = data.data || [];
                setNotifications(newNotifications);

                // Check for new unread notifications
                const unread = newNotifications.filter((n: any) => !n.read_at).length;
                if (unread > prevCount && prevCount !== 0) {
                    toast.success('You have new notifications!', { icon: '🔔' });
                }
                setPrevCount(unread);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications(); // Initial fetch only
    }, [token]);

    // WebSocket listener for order status updates
    useEffect(() => {
        if (!user) return;

        try {
            const echo = getEcho();
            const channel = echo.private(`user.${user.id}`);

            const handleOrderUpdate = (e: any) => {
                console.log('🔔 NotificationDropdown: Order status updated, refreshing notifications');
                fetchNotifications();
            };

            channel.listen('OrderStatusUpdated', handleOrderUpdate);
            channel.listen('.OrderStatusUpdated', handleOrderUpdate);
            channel.listen('App\\Events\\OrderStatusUpdated', handleOrderUpdate);

            return () => {
                channel.stopListening('OrderStatusUpdated');
                channel.stopListening('.OrderStatusUpdated');
                channel.stopListening('App\\Events\\OrderStatusUpdated');
            };
        } catch (error) {
            console.error('Error setting up notification WebSocket:', error);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            // Update local state
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-accent rounded-full transition-colors"
            >
                <FiBell className="w-6 h-6 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-border flex justify-between items-center">
                            <h3 className="font-semibold">Notifications</h3>
                            <button
                                onClick={fetchNotifications}
                                className="text-xs text-primary hover:underline"
                            >
                                Refresh
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-border last:border-0 hover:bg-accent/50 transition-colors ${!notification.read_at ? 'bg-secondary/50' : ''
                                            }`}
                                        onClick={() => !notification.read_at && markAsRead(notification.id)}
                                    >
                                        <p className="text-sm text-foreground font-medium">
                                            {notification.data.message || 'New Notification'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No notifications
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
