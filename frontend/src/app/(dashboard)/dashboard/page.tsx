'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiShoppingBag, FiMapPin, FiHeart } from 'react-icons/fi';
import Link from 'next/link';
import api from '@/lib/api';

export default function DashboardPage() {
    const { user } = useAuth();

    const [stats, setStats] = useState({
        orders: 0,
        addresses: 0,
        wishlist: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersRes, addressesRes, wishlistRes] = await Promise.all([
                    api.get('/orders'),
                    api.get('/addresses'),
                    api.get('/wishlist')
                ]);

                const ordersData = ordersRes.data.data ? ordersRes.data.data : (Array.isArray(ordersRes.data) ? ordersRes.data : []);

                setStats({
                    orders: ordersData.length,
                    addresses: Array.isArray(addressesRes.data) ? addressesRes.data.length : 0,
                    wishlist: Array.isArray(wishlistRes.data) ? wishlistRes.data.length : 0,
                    recentOrders: ordersData.slice(0, 5)
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statItems = [
        { label: 'Total Orders', value: stats.orders.toString(), icon: FiShoppingBag, color: 'bg-blue-500' },
        { label: 'Saved Addresses', value: stats.addresses.toString(), icon: FiMapPin, color: 'bg-green-500' },
        { label: 'Wishlist Items', value: stats.wishlist.toString(), icon: FiHeart, color: 'bg-pink-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Welcome back, {user?.name}!
                </h1>
                <p className="text-slate-600">
                    Manage your orders, addresses, and account details from your dashboard.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statItems.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
                        <div className={`${stat.color} p-4 rounded-xl text-white shadow-lg shadow-current/20`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{loading ? '...' : stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                    <Link href="/dashboard/orders" className="text-primary hover:underline text-sm font-medium">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    {stats.recentOrders.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="py-4 px-4 font-semibold text-slate-700">Order ID</th>
                                    <th className="py-4 px-4 font-semibold text-slate-700">Date</th>
                                    <th className="py-4 px-4 font-semibold text-slate-700">Status</th>
                                    <th className="py-4 px-4 font-semibold text-slate-700">Total</th>
                                    <th className="py-4 px-4 font-semibold text-slate-700 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order: any) => (
                                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4 font-medium text-slate-900">
                                            {order.order_number || `#${order.id}`}
                                        </td>
                                        <td className="py-4 px-4 text-slate-600">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 font-medium text-slate-900">
                                            Rs. {Number(order.total).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <Link
                                                href={`/dashboard/orders/${order.id}`}
                                                className="text-primary hover:text-primary/80 font-medium text-sm"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            No recent orders found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
