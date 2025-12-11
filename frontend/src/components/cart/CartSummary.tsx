'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { useCurrency } from '@/hooks/useCurrency';

interface CartSummaryProps {
    subtotal: number;
    shipping?: number;
    tax?: number;
}

export default function CartSummary({ subtotal, shipping = 0, tax = 0 }: CartSummaryProps) {
    const { formatPrice } = useCurrency();
    const total = subtotal + shipping + tax;

    return (
        <div className="bg-card p-6 rounded-2xl border border-border sticky top-24">
            <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-bold text-lg text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>
            </div>

            <Link
                href="/checkout"
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.02]"
            >
                Proceed to Checkout
                <FiArrowRight />
            </Link>

            <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                    Secure Checkout - SSL Encrypted
                </p>
            </div>
        </div>
    );
}
