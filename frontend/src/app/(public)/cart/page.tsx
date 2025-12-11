'use client';

import { useState, useEffect } from 'react';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import Link from 'next/link';
import { FiShoppingBag } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';



export default function CartPage() {
    const { items, updateQuantity, removeItem, cartTotal } = useCart();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hydration check
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }



    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
                    <FiShoppingBag className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
                <Link
                    href="/products"
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart ({items.length})</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-2xl border border-border p-6">
                        {items.map(item => (
                            <CartItem
                                key={item.product.id}
                                item={item}
                                onUpdateQuantity={(id, qty) => updateQuantity(id, qty)}
                                onRemove={(id) => removeItem(id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <CartSummary subtotal={cartTotal} />
                </div>
            </div>
        </div>
    );
}
