'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/hooks/useCurrency';

export default function WishlistPage() {
    const { token } = useAuth();
    const { addItem } = useCart();
    const { formatPrice } = useCurrency();
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, [token]);

    const fetchWishlist = async () => {
        if (!token) return;
        try {
            const res = await api.get('/wishlist');
            setWishlistItems(res.data || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (id: number) => {
        try {
            await api.delete(`/wishlist/${id}`);
            setWishlistItems(prev => prev.filter(item => item.id !== id));
            toast.success('Removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove item');
        }
    };

    const moveToCart = (product: any) => {
        addItem(product);
        toast.success('Added to cart');
    };

    if (!token) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiHeart className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Please Log In</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Login to view your wishlist and save your favorite items.
                </p>
                <Link
                    href="/login?redirect=/wishlist"
                    className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                    Login to View Wishlist
                </Link>
            </div>
        );
    }

    if (loading) {
        return <div className="p-12 text-center">Loading wishlist...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-foreground mb-8">My Wishlist</h1>

            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                        <div key={item.id} className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg transition-all">
                            <div className="relative aspect-square">
                                <Image
                                    src={item.product.image_url || '/placeholder.png'}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    onClick={() => removeFromWishlist(item.id)}
                                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <Link href={`/products/${item.product.slug}`}>
                                    <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {item.product.name}
                                    </h3>
                                </Link>
                                <p className="text-xl font-bold text-primary mb-4">
                                    {formatPrice(item.product.sale_price || item.product.price)}
                                </p>
                                <button
                                    onClick={() => moveToCart(item.product)}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-card rounded-3xl border border-border">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiHeart className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
                    <p className="text-muted-foreground mb-8">Save items you love to buy them later.</p>
                    <Link
                        href="/products"
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            )}
        </div>
    );
}
