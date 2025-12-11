'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiBox, FiShoppingBag, FiUsers, FiSettings, FiLogOut, FiFolder, FiStar, FiTag, FiTrendingUp, FiMessageCircle } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getEcho } from '@/lib/echo';
import { toast } from 'react-hot-toast';

const menuItems = [
    { icon: FiHome, label: 'Dashboard', href: '/admin' },
    { icon: FiBox, label: 'Products', href: '/admin/products' },
    { icon: FiFolder, label: 'Categories', href: '/admin/categories' },
    { icon: FiShoppingBag, label: 'Orders', href: '/admin/orders' },
    { icon: FiMessageCircle, label: 'Live Chat', href: '/admin/chat', hasBadge: true },
    { icon: FiUsers, label: 'Users', href: '/admin/users' },
    { icon: FiStar, label: 'Reviews', href: '/admin/reviews' },
    { icon: FiTag, label: 'Coupons', href: '/admin/coupons' },
    { icon: FiTrendingUp, label: 'Popular Searches', href: '/admin/popular-searches' },
    { icon: FiBox, label: 'Banners', href: '/admin/banners' },
    { icon: FiSettings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();

        // WebSocket listener for admin chat
        try {
            const echo = getEcho();
            const chatChannel = echo.private('admin.chat');

            const handleUpdate = (e: any) => {
                console.log('🔔 Sidebar: ConversationUpdated', e);
                fetchUnreadCount();

                // Show toast if not on chat page and new message
                if (!pathname.includes('/admin/chat') && e.conversation?.last_message?.sender_type === 'customer') {
                    toast.success(`New message from ${e.conversation.user.name}`, {
                        icon: '💬',
                        duration: 4000
                    });
                }
            };

            chatChannel.listen('ConversationUpdated', handleUpdate);
            chatChannel.listen('.ConversationUpdated', handleUpdate);
            chatChannel.listen('App\\Events\\ConversationUpdated', handleUpdate);

            // WebSocket listener for new orders
            const notificationsChannel = echo.private('admin.notifications');

            const handleNewOrder = (e: any) => {
                console.log('🛒 Sidebar: NewOrderNotification', e);

                // Show toast notification
                if (!pathname.includes('/admin/orders')) {
                    toast.success(`New order from ${e.order.user.name}`, {
                        icon: '🛒',
                        duration: 5000
                    });
                }
            };

            notificationsChannel.listen('NewOrderNotification', handleNewOrder);
            notificationsChannel.listen('.NewOrderNotification', handleNewOrder);
            notificationsChannel.listen('App\\Events\\NewOrderNotification', handleNewOrder);

            return () => {
                chatChannel.stopListening('ConversationUpdated');
                chatChannel.stopListening('.ConversationUpdated');
                chatChannel.stopListening('App\\Events\\ConversationUpdated');
                echo.leave('admin.chat');

                notificationsChannel.stopListening('NewOrderNotification');
                notificationsChannel.stopListening('.NewOrderNotification');
                notificationsChannel.stopListening('App\\Events\\NewOrderNotification');
                echo.leave('admin.notifications');
            };
        } catch (error) {
            console.error('Error setting up sidebar WebSocket:', error);
        }
    }, [pathname]);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/admin/chat/stats');
            setUnreadCount(res.data.total_unread);
        } catch (error) {
            console.error('Error fetching chat stats:', error);
        }
    };

    return (
        <aside className="w-64 bg-white text-slate-700 flex flex-col h-screen sticky top-0 border-r border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
                <Link href="/admin" className="flex items-center gap-3 text-slate-900">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-md">
                        A
                    </div>
                    <span className="text-xl font-bold tracking-tight">Admin Panel</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-2">
                    Main Menu
                </p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary text-white shadow-sm"
                                    : "hover:bg-slate-100 text-slate-700"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700")} />
                            <span className="font-medium">{item.label}</span>

                            {/* Unread Badge */}
                            {item.hasBadge && unreadCount > 0 && (
                                <span className={cn(
                                    "absolute right-4 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold rounded-full",
                                    isActive ? "bg-white text-primary" : "bg-red-500 text-white"
                                )}>
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200">
                <button
                    onClick={async () => {
                        await logout();
                        window.location.href = '/admin-login';
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors group"
                >
                    <FiLogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
