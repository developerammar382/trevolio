'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useCart } from '@/context/CartContext';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    images: string[];
    category: {
        name: string;
        slug: string;
    };
}

interface WishlistItem {
    id: number;
    product_id: number;
    product: Product;
}

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await api.get('/wishlist');
            setWishlist(res.data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId: number) => {
        try {
            await api.post('/wishlist/toggle', { product_id: productId });
            setWishlist(prev => prev.filter(item => item.product_id !== productId));
            toast.success('Removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove item');
        }
    };

    const handleAddToCart = (product: Product) => {
        addToCart(product, 1);
        toast.success('Added to cart');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : wishlist.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiHeart className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-slate-500 mb-6">Save items you love to buy later.</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
                            <div className="relative aspect-square bg-slate-100">
                                {item.product.images && item.product.images[0] ? (
                                    <Image
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        No Image
                                    </div>
                                )}
                                <button
                                    onClick={() => removeFromWishlist(item.product_id)}
                                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                    title="Remove from wishlist"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-4">
                                <div className="text-xs text-slate-500 mb-1">{item.product.category?.name}</div>
                                <Link href={`/products/${item.product.slug}`}>
                                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-1 hover:text-primary transition-colors">
                                        {item.product.name}
                                    </h3>
                                </Link>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex flex-col">
                                        {item.product.sale_price ? (
                                            <>
                                                <span className="text-sm text-slate-400 line-through">Rs. {item.product.price}</span>
                                                <span className="font-bold text-slate-900">Rs. {item.product.sale_price}</span>
                                            </>
                                        ) : (
                                            <span className="font-bold text-slate-900">Rs. {item.product.price}</span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(item.product)}
                                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                                        title="Add to Cart"
                                    >
                                        <FiShoppingCart className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
