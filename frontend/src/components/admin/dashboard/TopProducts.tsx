'use client';

import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';
import { useCurrency } from '@/hooks/useCurrency';

interface TopProduct {
    id: number;
    name: string;
    sales_count: number;
    revenue: number;
    image_url: string;
}

interface TopProductsProps {
    products: TopProduct[];
}

export default function TopProducts({ products }: TopProductsProps) {
    const { formatPrice } = useCurrency();

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Top Products</h3>
                <Link href="/admin/products" className="text-sm text-primary hover:text-accent transition-colors flex items-center gap-1">
                    View All <FiExternalLink />
                </Link>
            </div>

            <div className="space-y-4">
                {products.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors group">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-slate-400 bg-slate-100 rounded-full text-sm">
                            #{index + 1}
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                            {product.image_url && (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-900 truncate group-hover:text-primary transition-colors">
                                {product.name}
                            </h4>
                            <p className="text-xs text-slate-500">
                                {product.sales_count} sales
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">
                                {formatPrice(product.revenue)}
                            </p>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        No sales data available yet.
                    </div>
                )}
            </div>
        </div>
    );
}
