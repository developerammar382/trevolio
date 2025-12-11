'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiTrash2, FiSearch, FiStar } from 'react-icons/fi';

interface Review {
    id: number;
    user?: {
        name: string;
        email: string;
    };
    product?: {
        name: string;
    };
    rating: number;
    comment: string;
    status: string;
    created_at: string;
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                status: statusFilter,
                ...(searchQuery && { search: searchQuery }),
            });
            const response = await api.get(`/admin/reviews?${params}`);
            console.log('Reviews API Response:', response.data);
            console.log('Reviews data:', response.data.data);
            setReviews(response.data.data);
            setLastPage(response.data.last_page);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [currentPage, statusFilter, searchQuery]);

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await api.patch(`/admin/reviews/${id}/status`, { status });
            toast.success(`Review ${status}`);
            fetchReviews();
        } catch (error) {
            toast.error('Failed to update review status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            await api.delete(`/admin/reviews/${id}`);
            toast.success('Review deleted');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    const columns = [
        {
            header: 'Product',
            cell: (review: Review) => (
                <div>
                    <p className="font-medium text-slate-900">
                        {review.product?.name || <span className="text-red-500">Product Deleted</span>}
                    </p>
                </div>
            ),
        },
        {
            header: 'Customer',
            cell: (review: Review) => (
                <div>
                    <p className="font-medium text-slate-900">
                        {review.user?.name || <span className="text-red-500">User Deleted</span>}
                    </p>
                    <p className="text-xs text-slate-500">{review.user?.email || 'N/A'}</p>
                </div>
            ),
        },
        {
            header: 'Rating',
            cell: (review: Review) => (
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <FiStar
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-slate-300'
                                }`}
                        />
                    ))}
                </div>
            ),
        },
        {
            header: 'Comment',
            cell: (review: Review) => (
                <p className="text-sm text-slate-700 max-w-md truncate">
                    {review.comment || <span className="text-slate-400">No comment</span>}
                </p>
            ),
        },
        {
            header: 'Status',
            cell: (review: Review) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${review.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : review.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : review.status === 'hidden'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-yellow-100 text-yellow-700'
                        }`}
                >
                    {review.status}
                </span>
            ),
        },
        {
            header: 'Actions',
            cell: (review: Review) => (
                <div className="flex items-center gap-2">
                    <select
                        value={review.status}
                        onChange={(e) => handleStatusUpdate(review.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="hidden">Hidden</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button
                        onClick={() => handleDelete(review.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Reviews</h1>
                <p className="text-muted-foreground mt-1">Manage customer product reviews</p>
                {/* Debug info */}
                <div className="mt-2 text-xs text-slate-500">
                    Reviews count: {reviews.length} | Loading: {loading.toString()} | Page: {currentPage}/{lastPage}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by product, customer, or comment..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="hidden">Hidden</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={reviews}
                isLoading={loading}
                pagination={{
                    currentPage,
                    lastPage,
                    onPageChange: setCurrentPage,
                }}
            />
        </div>
    );
}
