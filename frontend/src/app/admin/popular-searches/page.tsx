'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface PopularSearch {
    id: number;
    query: string;
    count: number;
    is_active: boolean;
}

export default function AdminPopularSearches() {
    const [searches, setSearches] = useState<PopularSearch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSearch, setEditingSearch] = useState<PopularSearch | null>(null);
    const [formData, setFormData] = useState({ query: '', count: 0, is_active: true });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        fetchSearches();
    }, [currentPage]);

    const fetchSearches = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/popular-searches?page=${currentPage}`);
            setSearches(response.data.data || []);
            setLastPage(response.data.last_page || 1);
        } catch (error) {
            console.error('Error fetching searches:', error);
            toast.error('Failed to load popular searches');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSearch) {
                await api.put(`/admin/popular-searches/${editingSearch.id}`, formData);
                toast.success('Search term updated');
            } else {
                await api.post('/admin/popular-searches', formData);
                toast.success('Search term added');
            }
            setIsModalOpen(false);
            fetchSearches();
            resetForm();
        } catch (error) {
            console.error('Error saving search:', error);
            toast.error('Failed to save search term');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this search term?')) {
            try {
                await api.delete(`/admin/popular-searches/${id}`);
                toast.success('Search term deleted');
                fetchSearches();
            } catch (error) {
                console.error('Error deleting search:', error);
                toast.error('Failed to delete search term');
            }
        }
    };

    const openEditModal = (search: PopularSearch) => {
        setEditingSearch(search);
        setFormData({
            query: search.query,
            count: search.count,
            is_active: search.is_active
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingSearch(null);
        setFormData({ query: '', count: 0, is_active: true });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Popular Searches</h1>
                    <p className="text-muted-foreground mt-1">Manage trending search terms</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors font-medium"
                >
                    <FiPlus /> Add New
                </button>
            </div>

            <DataTable
                isLoading={loading}
                data={searches}
                pagination={{
                    currentPage,
                    lastPage,
                    onPageChange: setCurrentPage
                }}
                columns={[
                    { header: 'Search Query', accessorKey: 'query', className: 'font-medium text-foreground' },
                    { header: 'Count', accessorKey: 'count' },
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
                                    onClick={() => openEditModal(item)}
                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    }
                ]}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900">
                                {editingSearch ? 'Edit Search Term' : 'Add Search Term'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Search Query</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.query}
                                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Count (Ranking)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.count}
                                    onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                                >
                                    {editingSearch ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
