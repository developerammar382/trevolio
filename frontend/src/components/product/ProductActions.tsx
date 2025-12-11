'use client';

import { useState, useEffect } from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { Product } from '@/types';
import ProductVariants from './ProductVariants';

interface ProductActionsProps {
    product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
    const { addItem } = useCart();
    const { token } = useAuth();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

    useEffect(() => {
        if (token && product.id) {
            checkWishlistStatus();
        }
    }, [token, product.id]);

    const checkWishlistStatus = async () => {
        try {
            const res = await api.get(`/wishlist/check/${product.id}`);
            setIsWishlisted(res.data.in_wishlist);
        } catch (error) {
            console.error('Error checking wishlist status:', error);
        }
    };

    const handleAddToCart = () => {
        if (product.stock_quantity <= 0) {
            toast.error('Product is out of stock');
            return;
        }

        // Check if all variants are selected
        if (product.variants && product.variants.length > 0) {
            const missingVariants = product.variants.filter(v => !selectedVariants[v.name]);
            if (missingVariants.length > 0) {
                toast.error(`Please select ${missingVariants[0].name}`);
                return;
            }
        }

        addItem({
            ...product,
            selectedVariants // Pass selected variants to cart
        });
        toast.success('Added to cart');
    };

    const handleWishlist = async () => {
        if (!token) {
            toast.error('Please login to use wishlist');
            return;
        }

        try {
            const res = await api.post('/wishlist/toggle', { product_id: product.id });
            setIsWishlisted(res.data.added);
            toast.success(res.data.message);
        } catch (error) {
            console.error('Error updating wishlist:', error);
            toast.error('Failed to update wishlist');
        }
    };

    return (
        <div className="space-y-6">
            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
                <ProductVariants
                    variants={product.variants}
                    onVariantChange={setSelectedVariants}
                />
            )}

            <div className="flex gap-4">
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity <= 0}
                    className="flex-1 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FiShoppingCart className="w-5 h-5" />
                    {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button
                    onClick={handleWishlist}
                    className={`px-6 py-4 border border-border rounded-xl hover:bg-accent hover:text-white transition-colors ${isWishlisted ? 'text-accent border-accent/20 bg-accent/5' : 'text-muted-foreground'
                        }`}
                >
                    <FiHeart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
            </div>
        </div>
    );
}
