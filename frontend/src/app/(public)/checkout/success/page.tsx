'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import api from '@/lib/api';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const orderId = searchParams.get('order_id');
    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        const confirmPayment = async () => {
            if (redirectStatus === 'succeeded' && paymentIntent && orderId && !verified) {
                setVerifying(true);
                try {
                    await api.post(`/orders/${orderId}/confirm-payment`, {
                        payment_intent: paymentIntent
                    });
                    setVerified(true);
                    clearCart();
                } catch (error) {
                    console.error('Payment confirmation failed:', error);
                    // Even if confirmation fails, the payment might have succeeded.
                    // The webhook should handle it as a fallback.
                } finally {
                    setVerifying(false);
                }
            } else if (!paymentIntent) {
                // COD or other method
                clearCart();
            }
        };

        confirmPayment();
    }, [redirectStatus, paymentIntent, orderId, verified, clearCart]);

    if (!orderId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Invalid Order</h1>
                    <Link href="/" className="text-primary hover:underline">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h1 className="text-xl font-bold">Verifying Payment...</h1>
                    <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-lg max-w-md w-full text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheckCircle className="w-8 h-8" />
                </div>

                <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-muted-foreground mb-6">
                    Thank you for your purchase. Your order #{orderId} has been confirmed.
                </p>

                <div className="space-y-3">
                    <Link
                        href={`/dashboard/orders/${orderId}`}
                        className="block w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all"
                    >
                        View Order
                    </Link>
                    <Link
                        href="/products"
                        className="block w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
