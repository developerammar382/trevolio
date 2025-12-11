'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './NotificationBell';
import SystemAlerts from './SystemAlerts';
import { FiSearch } from 'react-icons/fi';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 1) {
                performSearch();
            } else {
                setResults(null);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/search?query=${query}`);
            setResults(response.data);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResultClick = (path: string) => {
        router.push(path);
        setShowResults(false);
        setQuery('');
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative w-full max-w-md" ref={searchRef}>
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search products, orders, users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length > 1 && setShowResults(true)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />

                    {/* Search Results Dropdown */}
                    {showResults && (results || loading) && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-slate-200 shadow-lg max-h-96 overflow-y-auto z-50">
                            {loading ? (
                                <div className="p-4 text-center text-slate-500 text-sm">Searching...</div>
                            ) : (
                                <>
                                    {/* Products */}
                                    {results?.products?.length > 0 && (
                                        <div className="p-2">
                                            <h3 className="text-xs font-semibold text-slate-500 px-2 mb-1 uppercase">Products</h3>
                                            {results.products.map((product: any) => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => handleResultClick(`/admin/products/${product.id}`)}
                                                    className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-md flex items-center gap-2"
                                                >
                                                    <div className="w-8 h-8 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                                        {product.image_url && (
                                                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                                                        <p className="text-xs text-slate-500">{product.sku}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Orders */}
                                    {results?.orders?.length > 0 && (
                                        <div className="p-2 border-t border-slate-100">
                                            <h3 className="text-xs font-semibold text-slate-500 px-2 mb-1 uppercase">Orders</h3>
                                            {results.orders.map((order: any) => (
                                                <button
                                                    key={order.id}
                                                    onClick={() => handleResultClick(`/admin/orders/${order.id}`)}
                                                    className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-md"
                                                >
                                                    <p className="text-sm font-medium text-slate-900">Order #{order.id}</p>
                                                    <p className="text-xs text-slate-500">{order.user?.name} • {order.user?.email}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Users */}
                                    {results?.users?.length > 0 && (
                                        <div className="p-2 border-t border-slate-100">
                                            <h3 className="text-xs font-semibold text-slate-500 px-2 mb-1 uppercase">Users</h3>
                                            {results.users.map((user: any) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => handleResultClick(`/admin/users`)} // Users page doesn't have detail view yet, or maybe it does? Assuming list for now.
                                                    className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-md"
                                                >
                                                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Categories */}
                                    {results?.categories?.length > 0 && (
                                        <div className="p-2 border-t border-slate-100">
                                            <h3 className="text-xs font-semibold text-slate-500 px-2 mb-1 uppercase">Categories</h3>
                                            {results.categories.map((cat: any) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => handleResultClick(`/admin/categories`)}
                                                    className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-md"
                                                >
                                                    <p className="text-sm font-medium text-slate-900">{cat.name}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {(!results?.products?.length && !results?.orders?.length && !results?.users?.length && !results?.categories?.length) && (
                                        <div className="p-4 text-center text-slate-500 text-sm">No results found</div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <SystemAlerts />
                <NotificationBell />

                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-slate-900">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role || 'Administrator'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-lg ring-2 ring-white shadow-sm">
                        {user?.name?.[0] || 'A'}
                    </div>
                </div>
            </div>
        </header>
    );
}
