'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiSearch } from 'react-icons/fi';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';

interface Coupon {
    id: number;
    code: string;
    type: 'fixed' | 'percentage';
    value: number;
    min_order_amount?: number;
    max_discount?: number;
    usage_limit?: number;
    used_count: number;
    valid_from?: string;
    valid_until?: string;
    is_active: boolean;
    created_at: string;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [formData, setFormData] = useState({
        code: '',
        type: 'fixed' as 'fixed' | 'percentage',
        value: '',
        min_order_amount: '',
        max_discount: '',
        usage_limit: '',
        valid_from: '',
        valid_until: '',
        is_active: true,
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCoupons();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, currentPage]);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            params.append('page', currentPage.toString());

            const response = await api.get(`/admin/coupons?${params.toString()}`);
            setCoupons(response.data.data || []);
            setLastPage(response.data.last_page || 1);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCoupon) {
                await api.put(`/admin/coupons/${editingCoupon.id}`, formData);
                toast.success('Coupon updated successfully');
            } else {
                await api.post('/admin/coupons', formData);
                toast.success('Coupon created successfully');
            }
            resetForm();
            fetchCoupons();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save coupon');
        }
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value.toString(),
            min_order_amount: coupon.min_order_amount?.toString() || '',
            max_discount: coupon.max_discount?.toString() || '',
            usage_limit: coupon.usage_limit?.toString() || '',
            valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
            valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
            is_active: coupon.is_active,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await api.delete(`/admin/coupons/${id}`);
            toast.success('Coupon deleted successfully');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const toggleActive = async (id: number) => {
        try {
            await api.post(`/admin/coupons/${id}/toggle-active`);
            toast.success('Coupon status updated');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            type: 'fixed',
            value: '',
            min_order_amount: '',
            max_discount: '',
            usage_limit: '',
            valid_from: '',
            valid_until: '',
            is_active: true,
        });
        setEditingCoupon(null);
        setShowForm(false);
    };

    const columns = [
        {
            header: 'Code',
            cell: (coupon: Coupon) => (
                <span className="font-mono font-bold text-primary">{coupon.code}</span>
            ),
        },
        {
            header: 'Type',
            cell: (coupon: Coupon) => (
                <span className="capitalize">{coupon.type}</span>
            ),
        },
        {
            header: 'Value',
            cell: (coupon: Coupon) => (
                <span>{coupon.type === 'percentage' ? `${coupon.value}%` : `Rs. ${coupon.value}`}</span>
            ),
        },
        {
            header: 'Usage',
            cell: (coupon: Coupon) => (
                <span>{coupon.used_count} / {coupon.usage_limit || '∞'}</span>
            ),
        },
        {
            header: 'Valid Until',
            cell: (coupon: Coupon) => (
                <span>{coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'No expiry'}</span>
            ),
        },
        {
            header: 'Status',
            cell: (coupon: Coupon) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {coupon.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            header: 'Actions',
            cell: (coupon: Coupon) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => toggleActive(coupon.id)}
                        className="p-2 hover:bg-slate-100 rounded transition-colors"
                        title={coupon.is_active ? 'Deactivate' : 'Activate'}
                    >
                        {coupon.is_active ? <FiToggleRight className="w-5 h-5 text-green-600" /> : <FiToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                    <button
                        onClick={() => handleEdit(coupon)}
                        className="p-2 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                    >
                        <FiEdit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                    >
                        <FiTrash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Coupons</h1>
                    <p className="text-slate-600">Manage discount codes and promotions</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
                >
                    <FiPlus className="w-5 h-5" />
                    Create Coupon
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                </select>
            </div>

            {/* Coupon Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Code *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                                        placeholder="SAVE20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'fixed' | 'percentage' })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="fixed">Fixed Amount</option>
                                        <option value="percentage">Percentage</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Value * {formData.type === 'percentage' && '(%)'}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        placeholder={formData.type === 'percentage' ? '10' : '100'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Min Order Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.min_order_amount}
                                        onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                                {formData.type === 'percentage' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Max Discount</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.max_discount}
                                            onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            placeholder="No limit"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={formData.usage_limit}
                                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        placeholder="Unlimited"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Valid From</label>
                                    <input
                                        type="date"
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Valid Until</label>
                                    <input
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="is_active" className="text-sm font-semibold text-slate-700">
                                    Active (Available for use)
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                                >
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Coupons Table */}
            <DataTable
                data={coupons}
                columns={columns}
                loading={loading}
                pagination={{
                    currentPage,
                    lastPage,
                    total,
                    onPageChange: setCurrentPage,
                }}
            />
        </div>
    );
}
