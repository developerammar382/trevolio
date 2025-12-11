'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiBox } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { useCurrency } from '@/hooks/useCurrency';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
    products: Product[];
    title?: string;
}

export default function ProductGrid({ products, title }: ProductGridProps) {
    return (
        <div>
            {title && (
                <div className="mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-4">{title}</h2>
                    <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
                </div>
            )}

            {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiBox className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 font-heading">No Products Found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {products.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
}
