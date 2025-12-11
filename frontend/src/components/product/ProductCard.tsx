'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCurrency } from '@/hooks/useCurrency';
import { Product } from '@/types';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
    product: Product;
    index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { formatPrice } = useCurrency();
    const { addItem } = useCart();
    const { token } = useAuth();
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);

    // Check wishlist status on mount
    useEffect(() => {
        if (token && product.id) {
            checkWishlistStatus();
        }
    }, [token, product.id]);

    const checkWishlistStatus = async () => {
        try {
            const res = await api.get(`/wishlist/check/${product.id}`);
            setIsInWishlist(res.data.in_wishlist);
        } catch (error) {
            console.error('Error checking wishlist status:', error);
        }
    };

    const isOutOfStock = product.stock_quantity <= 0;
    const hasDiscount = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price);
    const discountPercent = hasDiscount
        ? Math.round(((parseFloat(product.price) - parseFloat(product.sale_price)) / parseFloat(product.price)) * 100)
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) {
            toast.error('Product is out of stock');
            return;
        }

        addItem(product);
        toast.success('Added to cart');
    };

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!token) {
            toast.error('Please login to add items to wishlist', {
                icon: '🔒',
                duration: 4000,
            });
            return;
        }

        setIsWishlistLoading(true);
        try {
            const res = await api.post('/wishlist/toggle', { product_id: product.id });
            setIsInWishlist(res.data.added);
            toast.success(res.data.message);
        } catch (error) {
            console.error('Error updating wishlist:', error);
            toast.error('Failed to update wishlist');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <Link href={`/products/${product.slug || product.id}`} className="block h-full">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col border border-slate-100">
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
                        <img
                            src={product.image_url || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {hasDiscount && (
                                <span className="px-2 py-1 bg-accent text-white text-xs font-bold rounded-md shadow-sm">
                                    -{discountPercent}%
                                </span>
                            )}
                            {product.is_featured && (
                                <span className="px-2 py-1 bg-primary text-white text-xs font-bold rounded-md shadow-sm">
                                    Featured
                                </span>
                            )}
                            {isOutOfStock && (
                                <span className="px-2 py-1 bg-slate-800 text-white text-xs font-bold rounded-md shadow-sm">
                                    Sold Out
                                </span>
                            )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                            onClick={handleWishlist}
                            disabled={isWishlistLoading}
                            className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-sm group-hover:opacity-100 ${isInWishlist
                                ? 'bg-accent/10 text-accent opacity-100'
                                : 'bg-white/80 text-slate-600 opacity-0 hover:bg-accent hover:text-white'
                                }`}
                        >
                            <FiHeart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                        </button>

                        {/* Quick Add Button */}
                        {!isOutOfStock && (
                            <button
                                onClick={handleAddToCart}
                                className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-md translate-y-12 group-hover:translate-y-0 duration-300"
                            >
                                <FiShoppingCart className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-medium text-base text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors font-heading">
                            {product.name}
                        </h3>

                        <div className="mt-auto pt-2 flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-accent">
                                        {formatPrice(product.sale_price || product.price)}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-xs text-muted-foreground line-through">
                                            {formatPrice(product.price)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
