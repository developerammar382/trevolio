'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import { FiEye, FiDownload, FiFilter, FiSearch } from 'react-icons/fi';
import Link from 'next/link';
import { useCurrency } from '@/hooks/useCurrency';

interface Order {
    id: number;
    user: { name: string; email: string };
    total: number | string;
    status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
}

export default function OrdersPage() {
    const { formatPrice } = useCurrency();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchOrders();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, paymentFilter, currentPage]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (paymentFilter !== 'all') params.append('payment_status', paymentFilter);
            params.append('page', currentPage.toString());

            const response = await api.get(`/admin/orders?${params.toString()}`);
            setOrders(response.data.data || []);
            setLastPage(response.data.last_page || 1);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Orders</h1>
                    <p className="text-muted-foreground mt-1">Track and manage customer orders ({total})</p>
                </div>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search orders (ID, Customer Name/Email)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[150px]"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[150px]"
                >
                    <option value="all">All Payments</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                </select>
            </div>

            <DataTable
                isLoading={loading}
                data={orders}
                pagination={{
                    currentPage,
                    lastPage,
                    onPageChange: setCurrentPage
                }}
                columns={[
                    {
                        header: 'Order ID',
                        cell: (item) => <span className="font-mono text-xs">#{item.id}</span>
                    },
                    {
                        header: 'Customer',
                        cell: (item) => (
                            <div>
                                <div className="font-medium text-foreground">{item.user?.name}</div>
                                <div className="text-xs text-muted-foreground">{item.user?.email}</div>
                            </div>
                        )
                    },
                    {
                        header: 'Total',
                        cell: (item) => <span className="font-medium">{formatPrice(item.total)}</span>
                    },
                    {
                        header: 'Status',
                        cell: (item) => (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(item.status)}`}>
                                {item.status}
                            </span>
                        )
                    },
                    {
                        header: 'Payment Method',
                        cell: (item) => (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                                {item.payment_method === 'cod' ? 'Cash on Delivery' : (item.payment_method || 'N/A')}
                            </span>
                        )
                    },
                    {
                        header: 'Payment Status',
                        cell: (item) => (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${item.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {item.payment_status}
                            </span>
                        )
                    },
                    {
                        header: 'Date',
                        cell: (item) => new Date(item.created_at).toLocaleDateString()
                    },
                    {
                        header: 'Actions',
                        className: 'text-right',
                        cell: (item) => (
                            <div className="flex justify-end">
                                <button
                                    onClick={(e) => { e.stopPropagation(); router.push(`/admin/orders/${item.id}`); }}
                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                >
                                    <FiEye className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    }
                ]}
                onRowClick={(item) => router.push(`/admin/orders/${item.id}`)}
            />
        </div>
    );
}
