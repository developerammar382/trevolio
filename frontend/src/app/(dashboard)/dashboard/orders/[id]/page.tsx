'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiPackage, FiMapPin, FiCreditCard, FiDownload, FiAlertCircle, FiClock } from 'react-icons/fi';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import OrderStatusTimeline from '@/components/admin/OrderStatusTimeline';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

interface OrderItem {
    id: number;
    product: {
        name: string;
        images: string[];
        slug: string;
    };
    quantity: number;
    price: number;
    total: number;
    variants?: Record<string, string> | string | null;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    shipping_address: any;
    total: number | string;
    subtotal: number | string;
    tax_amount: number | string;
    shipping_cost: number | string;
    discount_amount: number | string;
    created_at: string;
    items: OrderItem[];
    status_history: any[];
}

export default function OrderDetailPage() {
    const { formatPrice } = useCurrency();
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchOrder();
        }
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${params.id}`);
            setOrder(res.data);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
            router.push('/dashboard/orders');
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = async () => {
        if (!order) return;
        setDownloading(true);
        try {
            const response = await api.get(`/orders/${order.id}/invoice`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${order.order_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Invoice downloaded successfully');
        } catch (error) {
            console.error('Error downloading invoice:', error);
            toast.error('Failed to download invoice');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!order) return null;

    const shippingAddress = typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/dashboard/orders"
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Order #{order.order_number}</h1>
                    <p className="text-slate-500 text-sm">
                        Placed on {format(new Date(order.created_at), 'MMMM d, yyyy h:mm a')}
                    </p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={downloadInvoice}
                        disabled={downloading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <FiDownload className={downloading ? "animate-bounce" : ""} />
                        {downloading ? 'Downloading...' : 'Invoice'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FiPackage />
                            Order Items
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 py-4 border-b border-slate-100 last:border-0">
                                    <div className="relative w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.product.images && item.product.images[0] ? (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-slate-900 line-clamp-2">{item.product.name}</h3>
                                                {item.variants && (() => {
                                                    const variantsObj = typeof item.variants === 'string'
                                                        ? JSON.parse(item.variants)
                                                        : item.variants;
                                                    return Object.keys(variantsObj).length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                                            {Object.entries(variantsObj).map(([key, value]) => (
                                                                <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-xs">
                                                                    <span className="text-slate-500">{key}:</span>
                                                                    <span className="font-medium text-slate-700">{value as string}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                                <p className="text-sm text-slate-500 mt-1">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-slate-900">Rs. {item.total}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Shipping</span>
                                <span>{formatPrice(order.shipping_cost)}</span>
                            </div>
                            {order.discount_amount && Number(order.discount_amount) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>- {formatPrice(order.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-900 font-bold text-lg pt-2 border-t border-slate-100">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <FiClock />
                            Order Status
                        </h2>
                        <OrderStatusTimeline history={order.status_history || []} currentStatus={order.status} />
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FiMapPin />
                            Shipping Address
                        </h2>
                        {shippingAddress ? (
                            <div className="text-sm text-slate-600 space-y-1">
                                <p className="font-medium text-slate-900">{shippingAddress.name}</p>
                                <p>{shippingAddress.address_line1}</p>
                                {shippingAddress.address_line2 && <p>{shippingAddress.address_line2}</p>}
                                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
                                <p>{shippingAddress.country}</p>
                                <p className="mt-2">{shippingAddress.phone}</p>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm">Address information not available</p>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FiCreditCard />
                            Payment Information
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 text-sm">Method</span>
                                <span className="font-medium text-slate-900 capitalize">{order.payment_method}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 text-sm">Status</span>
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium capitalize",
                                    order.payment_status === 'paid' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                )}>
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Need Help? */}
                    <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
                        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <FiAlertCircle />
                            Need Help?
                        </h3>
                        <p className="text-sm text-blue-700 mb-4">
                            If you have any issues with your order, please contact our support team.
                        </p>
                        <Link
                            href="/contact"
                            className="block w-full py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
