'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortDropdown() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || '';

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('sort', value);
        } else {
            params.delete('sort');
        }
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-3">
            <label htmlFor="sort" className="text-sm font-medium text-slate-700 whitespace-nowrap">Sort by:</label>
            <select
                id="sort"
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer font-medium"
            >
                <option value="">Default</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
            </select>
        </div>
    );
}
