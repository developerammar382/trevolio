'use client';

import { useState, useEffect } from 'react';
import { FiBell, FiPackage, FiAlertTriangle, FiShoppingCart, FiFilter, FiCheck, FiTrash2 } from 'react-icons/fi';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    data: any;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        fetchNotifications();
        fetchStats();
    }, [filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? `?type=${filter}` : '';
            const response = await api.get(`/admin/notifications${params}`);
            setNotifications(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/notifications/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const runChecks = async () => {
        setChecking(true);
        try {
            await api.post('/admin/notifications/check-all');
            toast.success('Notification checks completed');
            fetchNotifications();
            fetchStats();
        } catch (error) {
            console.error('Error running checks:', error);
            toast.error('Failed to run checks');
        } finally {
            setChecking(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/admin/notifications/${id}/read`);
            fetchNotifications();
            fetchStats();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/admin/notifications/read-all');
            toast.success('All notifications marked as read');
            fetchNotifications();
            fetchStats();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (id: number) => {
        if (!confirm('Delete this notification?')) return;

        try {
            await api.delete(`/admin/notifications/${id}`);
            toast.success('Notification deleted');
            fetchNotifications();
            fetchStats();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete notification');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'low_stock':
                return <FiPackage className="w-6 h-6 text-orange-500" />;
            case 'pending_delivery':
                return <FiAlertTriangle className="w-6 h-6 text-yellow-500" />;
            case 'new_order':
                return <FiShoppingCart className="w-6 h-6 text-green-500" />;
            default:
                return <FiBell className="w-6 h-6 text-blue-500" />;
        }
    };

    const getLink = (notification: Notification) => {
        if (notification.type === 'low_stock' && notification.data?.product_id) {
            return `/admin/products/${notification.data.product_id}`;
        }
        if (notification.type === 'pending_delivery' && notification.data?.order_id) {
            return `/admin/orders/${notification.data.order_id}`;
        }
        if (notification.type === 'new_order' && notification.data?.order_id) {
            return `/admin/orders/${notification.data.order_id}`;
        }
        return '#';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-slate-600 mt-1">Manage your admin alerts and reminders</p>
                </div>
                <button
                    onClick={runChecks}
                    disabled={checking}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {checking ? 'Checking...' : 'Run Checks'}
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                            </div>
                            <FiBell className="w-8 h-8 text-slate-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Unread</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.unread}</p>
                            </div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Low Stock</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.by_type?.low_stock || 0}</p>
                            </div>
                            <FiPackage className="w-8 h-8 text-orange-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Pending Orders</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.by_type?.pending_delivery || 0}</p>
                            </div>
                            <FiAlertTriangle className="w-8 h-8 text-yellow-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FiFilter className="w-4 h-4 text-slate-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="all">All Notifications</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="pending_delivery">Pending Delivery</option>
                            <option value="new_order">New Orders</option>
                        </select>
                    </div>
                    {stats?.unread > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                        >
                            <FiCheck className="w-4 h-4" />
                            Mark All as Read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiBell className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-600 font-medium">No notifications</p>
                        <p className="text-sm text-slate-500 mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-6 hover:bg-slate-50 transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.is_read && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                                    )}
                                                </div>
                                                <p className="text-slate-600 mt-1">{notification.message}</p>
                                                <p className="text-xs text-slate-400 mt-2">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getLink(notification) !== '#' && (
                                                    <Link
                                                        href={getLink(notification)}
                                                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                                                        className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
                                                    >
                                                        View
                                                    </Link>
                                                )}
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <FiCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
