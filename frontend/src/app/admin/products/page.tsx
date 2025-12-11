'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import Link from 'next/link';
import { useCurrency } from '@/hooks/useCurrency';

interface Product {
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
    category: { name: string };
    is_active: boolean;
}

export default function AdminProducts() {
    const { formatPrice } = useCurrency();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, currentPage]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            params.append('page', currentPage.toString());

            const response = await api.get(`/admin/products?${params.toString()}`);
            setProducts(response.data.data || []);
            setLastPage(response.data.last_page || 1);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/admin/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Products</h1>
                    <p className="text-muted-foreground mt-1">Manage your product inventory ({total} items)</p>
                </div>
                <Link
                    href="/admin/products/create"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors font-medium"
                >
                    <FiPlus /> Add Product
                </Link>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[150px]"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <DataTable
                isLoading={loading}
                data={products}
                pagination={{
                    currentPage,
                    lastPage,
                    onPageChange: setCurrentPage
                }}
                columns={[
                    { header: 'Name', accessorKey: 'name', className: 'font-medium text-foreground' },
                    {
                        header: 'Price',
                        cell: (item) => formatPrice(item.price)
                    },
                    {
                        header: 'Category',
                        cell: (item) => (
                            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                                {item.category?.name || 'Uncategorized'}
                            </span>
                        )
                    },
                    {
                        header: 'Stock',
                        cell: (item) => (
                            <span className={item.stock_quantity > 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {item.stock_quantity} units
                            </span>
                        )
                    },
                    {
                        header: 'Status',
                        cell: (item) => (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {item.is_active ? 'Active' : 'Inactive'}
                            </span>
                        )
                    },
                    {
                        header: 'Actions',
                        className: 'text-right',
                        cell: (item) => (
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); router.push(`/admin/products/${item.id}`); }}
                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    }
                ]}
                onRowClick={(item) => router.push(`/admin/products/${item.id}`)}
            />
        </div>
    );
}
