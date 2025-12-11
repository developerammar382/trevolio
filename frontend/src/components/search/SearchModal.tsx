'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiTrendingUp, FiClock, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [popularSearches, setPopularSearches] = useState<any[]>([]);
    const [bestsellers, setBestsellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { formatPrice } = useCurrency();

    // Fetch initial data (popular & bestsellers)
    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            // Focus input after animation
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 1) {
                fetchSuggestions();
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const fetchInitialData = async () => {
        try {
            const [popularRes, bestsellersRes] = await Promise.all([
                api.get('/search/popular'),
                api.get('/search/bestsellers')
            ]);
            setPopularSearches(popularRes.data);
            setBestsellers(bestsellersRes.data);
        } catch (error) {
            console.error('Error fetching search data:', error);
        }
    };

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/search/suggestions?q=${query}`);
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.trim()) {
            router.push(`/products?search=${encodeURIComponent(query)}`);
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-20 px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Search Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                            <FiSearch className="w-6 h-6 text-slate-400" />
                            <form onSubmit={handleSearch} className="flex-1">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search for products, brands, and more..."
                                    className="w-full text-lg font-medium placeholder:text-slate-400 focus:outline-none"
                                />
                            </form>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <FiX className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {query.length > 1 ? (
                                // Search Results
                                <div className="space-y-6">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
                                                Products
                                            </h3>
                                            <div className="grid gap-2">
                                                {suggestions.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        href={`/products/${product.slug}`}
                                                        onClick={onClose}
                                                        className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors group"
                                                    >
                                                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img
                                                                    src={product.images[0].image_url || product.images[0]}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                    <FiSearch className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-slate-900 truncate group-hover:text-primary transition-colors">
                                                                {product.name}
                                                            </h4>
                                                            <p className="text-sm text-slate-500 mt-1">
                                                                {formatPrice(product.sale_price || product.price)}
                                                            </p>
                                                        </div>
                                                        <FiArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                                                    </Link>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handleSearch()}
                                                className="w-full mt-4 py-3 bg-slate-50 hover:bg-slate-100 text-primary font-medium rounded-xl transition-colors text-center"
                                            >
                                                View all results for "{query}"
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FiSearch className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-medium text-slate-900">No results found</h3>
                                            <p className="text-slate-500 mt-1">
                                                We couldn't find any products matching "{query}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Initial State (Popular & Bestsellers)
                                <div className="space-y-8">
                                    {/* Popular Searches */}
                                    <div>
                                        <h3 className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
                                            <FiTrendingUp className="w-4 h-4" /> Trending Now
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {popularSearches.length > 0 ? (
                                                popularSearches.map((search) => (
                                                    <button
                                                        key={search.id}
                                                        onClick={() => {
                                                            setQuery(search.query);
                                                            router.push(`/products?search=${encodeURIComponent(search.query)}`);
                                                            onClose();
                                                        }}
                                                        className="px-5 py-2.5 bg-slate-50 hover:bg-white hover:shadow-md hover:scale-105 hover:text-primary border border-slate-100 rounded-full text-sm font-medium text-slate-600 transition-all duration-200"
                                                    >
                                                        {search.query}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-400">No popular searches yet.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bestsellers */}
                                    <div>
                                        <h3 className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
                                            🔥 Bestsellers For You
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {bestsellers.length > 0 ? (
                                                bestsellers.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        href={`/products/${product.slug}`}
                                                        onClick={onClose}
                                                        className="group bg-white border border-slate-100 rounded-xl p-3 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                                                    >
                                                        <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden mb-3 relative">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img
                                                                    src={product.images[0].image_url || product.images[0]}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                    <FiSearch className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                                                                {product.name}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                                                {formatPrice(product.sale_price || product.price)}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-400 col-span-full">No bestsellers yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
