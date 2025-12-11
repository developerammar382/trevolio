'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiDownload, FiClock, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface OrderItem {
    id: number;
    product: { name: string; price: number };
    quantity: number;
    price: number;
    variants?: Record<string, string> | string | null;
}

interface StatusHistory {
    id: number;
    status: string;
    changed_by: number;
    changedBy?: { name: string };
    notes?: string;
    created_at: string;
}

interface Order {
    id: number;
    order_number: string;
    user: { name: string; email: string; phone?: string; address?: string };
    shipping_address?: any;
    billing_address?: any;
    total_amount: number;
    total: number;
    status: string;
    payment_status: string;
    payment_method: string;
    refund_status?: string;
    refund_amount?: number;
    refund_reason?: string;
    created_at: string;
    items: OrderItem[];
    statusHistory?: StatusHistory[];
}

export default function OrderDetails({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/admin/orders/${params.id}`);
            setOrder(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            await api.patch(`/admin/orders/${params.id}/status`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrder();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const updatePaymentStatus = async (newStatus: string) => {
        try {
            await api.patch(`/admin/orders/${params.id}/payment-status`, { payment_status: newStatus });
            toast.success(`Payment status updated to ${newStatus}`);
            fetchOrder();
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast.error('Failed to update payment status');
        }
    };

    const downloadInvoice = async () => {
        try {
            const response = await api.get(`/admin/orders/${params.id}/invoice`, {
                responseType: 'blob',
            });

            // Create a blob URL and trigger download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${order?.order_number || params.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Invoice downloaded successfully');
        } catch (error) {
            console.error('Error downloading invoice:', error);
            toast.error('Failed to download invoice');
        }
    };

    const processRefund = async (action: 'approve' | 'reject') => {
        try {
            await api.post(`/admin/orders/${params.id}/process-refund`, { action });
            toast.success(`Refund ${action}d successfully`);
            fetchOrder();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to process refund');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return <div>Order not found</div>;
    }

    const steps = [
        { status: 'pending', icon: FiPackage, label: 'Order Placed' },
        { status: 'processing', icon: FiPackage, label: 'Processing' },
        { status: 'shipped', icon: FiTruck, label: 'Shipped' },
        { status: 'delivered', icon: FiCheckCircle, label: 'Delivered' },
    ];

    const currentStepIndex = steps.findIndex(s => s.status === order.status) === -1
        ? (order.status === 'cancelled' ? -1 : 0)
        : steps.findIndex(s => s.status === order.status);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/orders"
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                >
                    <FiArrowLeft className="w-6 h-6 text-muted-foreground" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">Order #{order.order_number || order.id}</h1>
                    <p className="text-muted-foreground mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                </div>
                <button
                    onClick={downloadInvoice}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
                >
                    <FiDownload className="w-5 h-5" />
                    Download Invoice
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status Timeline */}
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-lg font-semibold mb-6 text-foreground">Order Progress</h3>
                        <div className="relative flex justify-between">
                            {/* Progress Bar Background */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0" />

                            {/* Active Progress Bar */}
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                                style={{ width: `${order.status === 'cancelled' ? 0 : (currentStepIndex / (steps.length - 1)) * 100}%` }}
                            />

                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={step.status} className="relative z-10 flex flex-col items-center bg-card px-2">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                                            isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-card border-muted text-muted-foreground",
                                            isCurrent && "ring-4 ring-primary/20"
                                        )}>
                                            <step.icon className="w-5 h-5" />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-medium mt-2",
                                            isCompleted ? "text-primary" : "text-muted-foreground"
                                        )}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {order.status === 'cancelled' && (
                            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                <FiXCircle className="w-5 h-5" />
                                <span className="font-medium">This order has been cancelled.</span>
                            </div>
                        )}
                    </div>

                    {/* Status History */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                                <FiClock className="w-5 h-5" />
                                Status History
                            </h3>
                            <div className="space-y-3">
                                {order.statusHistory.map((history) => (
                                    <div key={history.id} className="flex gap-4 pb-3 border-b border-border last:border-0">
                                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary"></div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-foreground capitalize">{history.status}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(history.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            {history.changedBy && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Changed by: {history.changedBy.name}
                                                </p>
                                            )}
                                            {history.notes && (
                                                <p className="text-sm text-muted-foreground mt-1 italic">
                                                    {history.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-foreground">Order Items</h3>
                        </div>
                        <div className="divide-y divide-border">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                                            <FiPackage className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{item.product?.name || 'Product Deleted'}</p>
                                            {item.variants && (() => {
                                                const variantsObj = typeof item.variants === 'string'
                                                    ? JSON.parse(item.variants)
                                                    : item.variants;
                                                return Object.keys(variantsObj).length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {Object.entries(variantsObj).map(([key, value]) => (
                                                            <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                                                                <span className="opacity-70">{key}:</span>
                                                                <span className="font-medium">{value as string}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                            <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium text-foreground">Rs. {Number(item.price).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-muted/30 border-t border-border">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-muted-foreground">Total Amount</span>
                                <span className="text-2xl font-bold text-foreground">Rs. {Number(order.total || order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Customer Details */}
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Customer Details</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium text-foreground">{order.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium text-foreground">{order.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium text-foreground">
                                    {(() => {
                                        try {
                                            const address = typeof order.shipping_address === 'string'
                                                ? JSON.parse(order.shipping_address)
                                                : order.shipping_address;
                                            return address?.phone || order.user?.phone || 'N/A';
                                        } catch (e) {
                                            return order.user?.phone || 'N/A';
                                        }
                                    })()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Shipping Address</p>
                                <div className="font-medium text-foreground">
                                    {(() => {
                                        try {
                                            const address = typeof order.shipping_address === 'string'
                                                ? JSON.parse(order.shipping_address)
                                                : order.shipping_address;

                                            if (!address) return 'N/A';

                                            return (
                                                <div className="text-sm">
                                                    <p>{address.address}</p>
                                                    <p>{address.city}, {address.state} {address.zip_code}</p>
                                                    <p>{address.country}</p>
                                                </div>
                                            );
                                        } catch (e) {
                                            return 'N/A';
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Order Actions</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Update Status</label>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateStatus(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Payment Status</label>
                                <select
                                    value={order.payment_status}
                                    onChange={(e) => updatePaymentStatus(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Refund Management */}
                    {order.refund_status && (
                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                                <FiDollarSign className="w-5 h-5" />
                                Refund Request
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={cn(
                                        "font-medium capitalize",
                                        order.refund_status === 'approved' ? 'text-green-600' :
                                            order.refund_status === 'rejected' ? 'text-red-600' :
                                                'text-yellow-600'
                                    )}>
                                        {order.refund_status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">Rs. {Number(order.refund_amount || 0).toFixed(2)}</span>
                                </div>
                                {order.refund_reason && (
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Reason:</span>
                                        <p className="text-sm bg-muted p-3 rounded">{order.refund_reason}</p>
                                    </div>
                                )}
                                {order.refund_status === 'requested' && (
                                    <div className="flex gap-2 pt-3">
                                        <button
                                            onClick={() => processRefund('approve')}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                        >
                                            Approve Refund
                                        </button>
                                        <button
                                            onClick={() => processRefund('reject')}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                        >
                                            Reject Refund
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
