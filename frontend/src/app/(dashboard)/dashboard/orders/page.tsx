'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPackage, FiChevronRight, FiClock, FiCheckCircle, FiXCircle, FiTruck } from 'react-icons/fi';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useCurrency } from '@/hooks/useCurrency';
import { getEcho } from '@/lib/echo';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface Order {
    id: number;
    order_number: string;
    // total: number | string;
    total: number;
    status: string;
    created_at: string;
    items_count: number;
}

export default function OrdersPage() {
    const { formatPrice } = useCurrency();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    // WebSocket listener for order status updates
    useEffect(() => {
        if (!user) return;

        try {
            const echo = getEcho();
            const channel = echo.private(`user.${user.id}`);

            const handleOrderUpdate = (e: any) => {
                // Update order in list
                setOrders(prev => prev.map(order =>
                    order.id === e.order_id
                        ? { ...order, status: e.status }
                        : order
                ));

                // Show toast notification
                const statusLabel = e.status.charAt(0).toUpperCase() + e.status.slice(1);
                toast.success(`Order status updated to: ${statusLabel}`, {
                    icon: '📦',
                    duration: 4000
                });
            };

            channel.listen('OrderStatusUpdated', handleOrderUpdate);
            channel.listen('.OrderStatusUpdated', handleOrderUpdate);
            channel.listen('App\\Events\\OrderStatusUpdated', handleOrderUpdate);

            return () => {
                channel.stopListening('OrderStatusUpdated');
                channel.stopListening('.OrderStatusUpdated');
                channel.stopListening('App\\Events\\OrderStatusUpdated');
                echo.leave(`user.${user.id}`);
            };
        } catch (error) {
            console.error('❌ Error setting up order WebSocket:', error);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            // Handle pagination response (Laravel returns { data: [...], ... })
            if (res.data && Array.isArray(res.data.data)) {
                setOrders(res.data.data);
            } else if (Array.isArray(res.data)) {
                setOrders(res.data);
            } else {
                setOrders([]);
                console.error('Unexpected orders response format:', res.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return FiCheckCircle;
            case 'cancelled': return FiXCircle;
            case 'shipped': return FiTruck;
            default: return FiClock;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiPackage className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders yet</h3>
                    <p className="text-slate-500 mb-6">Start shopping to see your orders here.</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const StatusIcon = getStatusIcon(order.status);
                        return (
                            <Link
                                key={order.id}
                                href={`/dashboard/orders/${order.id}`}
                                className="block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                                            <FiPackage className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-slate-900">{order.order_number}</h3>
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1",
                                                    getStatusColor(order.status)
                                                )}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                Placed on {format(new Date(order.created_at), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto w-full pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                                            <p className="font-bold text-slate-900">{formatPrice(order.total)}</p>
                                        </div>
                                        <FiChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
