'use client';

import { useState } from 'react';
import { FiLoader, FiArrowDown } from 'react-icons/fi';
import ProductGrid from './ProductGrid';
import api from '@/lib/api';
import { Product } from '@/types';

interface ProductListingProps {
    initialProducts: Product[];
    initialMeta: {
        current_page: number;
        last_page: number;
        total: number;
    };
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function ProductListing({ initialProducts, initialMeta, searchParams }: ProductListingProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [page, setPage] = useState(initialMeta.current_page);
    const [lastPage, setLastPage] = useState(initialMeta.last_page);
    const [loading, setLoading] = useState(false);

    const loadMore = async () => {
        if (loading || page >= lastPage) return;

        setLoading(true);
        try {
            // Construct query params
            const params = new URLSearchParams();
            Object.entries(searchParams).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });
            params.append('page', String(page + 1));
            params.append('per_page', '12');

            const response = await api.get(`/products?${params.toString()}`);
            const newData = response.data;

            setProducts([...products, ...newData.data]);
            setPage(newData.current_page);
            setLastPage(newData.last_page);
        } catch (error) {
            console.error('Error loading more products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="text-slate-600 text-lg">
                            Showing <span className="font-bold text-slate-900">{products.length}</span> of <span className="font-bold text-slate-900">{initialMeta.total}</span> products
                        </p>
                    </div>
                </div>
            </div>

            <ProductGrid products={products} />

            {page < lastPage && (
                <div className="mt-12 text-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <FiLoader className="w-5 h-5 animate-spin text-primary" />
                                <span>Loading more...</span>
                            </>
                        ) : (
                            <>
                                <span>Load More Products</span>
                                <FiArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                            </>
                        )}
                    </button>
                    <p className="mt-4 text-sm text-slate-400">
                        Showing {products.length} of {initialMeta.total} items
                    </p>
                </div>
            )}
        </div>
    );
}
