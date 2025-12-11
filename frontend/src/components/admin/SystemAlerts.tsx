'use client';

import { useState, useEffect, useRef } from 'react';
import { FiAlertTriangle, FiPackage, FiCheck, FiX } from 'react-icons/fi';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    is_read: boolean;
    created_at: string;
}

export default function SystemAlerts() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications(); // Initial fetch only

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/admin/notifications/recent?group=alerts');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.post(`/admin/notifications/${id}/read`);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success('Marked as read');
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'low_stock':
                return <FiPackage className="w-5 h-5 text-orange-500" />;
            case 'pending_delivery':
                return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />;
            default:
                return <FiAlertTriangle className="w-5 h-5 text-blue-500" />;
        }
    };

    const getLink = (notification: Notification) => {
        if (notification.type === 'low_stock' && notification.data?.product_id) {
            return `/admin/products/${notification.data.product_id}/edit`;
        }
        if (notification.type === 'pending_delivery' && notification.data?.order_id) {
            return `/admin/orders/${notification.data.order_id}`;
        }
        return '#';
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
                <FiAlertTriangle className="w-6 h-6" />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">System Alerts</h3>
                        <Link
                            href="/admin/notifications?type=alerts"
                            className="text-xs text-blue-600 hover:text-blue-700"
                            onClick={() => setIsOpen(false)}
                        >
                            View All
                        </Link>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-slate-500">
                                <FiCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-sm">No system alerts</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={getLink(notification)}
                                    className="block px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                {getTimeAgo(notification.created_at)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => markAsRead(notification.id, e)}
                                            className="flex-shrink-0 text-slate-300 hover:text-blue-500 p-1"
                                            title="Mark as read"
                                        >
                                            <span className="w-2 h-2 bg-blue-500 rounded-full block" />
                                        </button>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
