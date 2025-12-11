'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage, FiX } from 'react-icons/fi';
import * as Icons from 'react-icons/fi';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface Category {
    id: number;
    name: string;
    description?: string;
    icon_url?: string;
    icon_type: 'image' | 'icon';
    icon_name?: string;
    created_at: string;
}

// Common icons for e-commerce categories
const COMMON_ICONS = [
    'FiSmartphone', 'FiMonitor', 'FiWatch', 'FiHeadphones', 'FiCamera',
    'FiShoppingBag', 'FiShoppingCart', 'FiGift', 'FiTag', 'FiGrid',
    'FiHome', 'FiUser', 'FiSettings', 'FiMenu', 'FiList',
    'FiBook', 'FiCoffee', 'FiActivity', 'FiHeart', 'FiStar'
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon_type: 'image' as 'image' | 'icon',
        icon_name: ''
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCategories();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, currentPage]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', currentPage.toString());

            const response = await api.get(`/admin/categories?${params.toString()}`);
            setCategories(response.data.data || []);
            setLastPage(response.data.last_page || 1);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setFormData({ ...formData, icon_type: 'image' });
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('icon_type', formData.icon_type);

            if (formData.icon_type === 'icon') {
                if (formData.icon_name) {
                    data.append('icon_name', formData.icon_name);
                }
                // Explicitly remove image if switching to icon
                data.append('remove_image', '1');
            } else {
                // Image mode
                if (selectedFile) {
                    data.append('icon', selectedFile);
                } else if (editingCategory && !previewUrl) {
                    // If editing, in image mode, and no preview URL (meaning image was removed)
                    data.append('remove_image', '1');
                }
                // Clear icon name if switching to image
                data.append('icon_name', '');
            }

            if (editingCategory) {
                // data.append('_method', 'PUT'); // Removed to use direct POST route
                await api.post(`/admin/categories/${editingCategory.id}`, data);
                toast.success('Category updated successfully');
            } else {
                await api.post('/admin/categories', data);
                toast.success('Category created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save category');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', icon_type: 'image', icon_name: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        setEditingCategory(null);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon_type: category.icon_type || 'image',
            icon_name: category.icon_name || ''
        });
        setPreviewUrl(category.icon_url || null);
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete category');
        }
    };



    const renderIcon = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName];
        return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
                    <p className="text-slate-600 mt-1">Manage product categories</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <FiPlus className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            </div>

            <DataTable
                isLoading={loading}
                data={categories}
                pagination={{
                    currentPage,
                    lastPage,
                    onPageChange: setCurrentPage
                }}
                columns={[
                    {
                        header: 'Icon/Image',
                        cell: (category) => (
                            <div className="w-10 h-10">
                                {category.icon_type === 'icon' && category.icon_name ? (
                                    <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                                        {renderIcon(category.icon_name)}
                                    </div>
                                ) : category.icon_url || (category as any).icon_path ? (
                                    <div className="w-full h-full relative rounded-lg overflow-hidden border border-slate-200">
                                        <Image
                                            src={category.icon_url || `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${(category as any).icon_path}`}
                                            alt={category.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                        <FiImage className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        )
                    },
                    { header: 'Name', accessorKey: 'name', className: 'font-medium text-foreground' },
                    { header: 'Description', accessorKey: 'description', className: 'text-muted-foreground' },
                    {
                        header: 'Created',
                        cell: (item) => new Date(item.created_at).toLocaleDateString()
                    },
                    {
                        header: 'Actions',
                        className: 'text-right',
                        cell: (item) => (
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    }
                ]}
            />

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Display Type Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Display Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="icon_type"
                                            value="image"
                                            checked={formData.icon_type === 'image'}
                                            onChange={() => setFormData({ ...formData, icon_type: 'image' })}
                                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700">Image Upload</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="icon_type"
                                            value="icon"
                                            checked={formData.icon_type === 'icon'}
                                            onChange={() => setFormData({ ...formData, icon_type: 'icon' })}
                                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700">Select Icon</span>
                                    </label>
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            {formData.icon_type === 'image' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category Image</label>
                                    <div className="flex items-center gap-4">
                                        {previewUrl ? (
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                                                <Image
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FiTrash2 className="w-6 h-6 text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 border-dashed">
                                                <FiImage className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="block w-full text-sm text-slate-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-blue-50 file:text-blue-700
                                                    hover:file:bg-blue-100
                                                "
                                            />
                                            <p className="mt-1 text-xs text-slate-500">PNG, JPG, GIF up to 2MB</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Icon Picker Section */}
                            {formData.icon_type === 'icon' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Icon</label>
                                    <div className="grid grid-cols-5 gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                                        {COMMON_ICONS.map((iconName) => {
                                            const Icon = (Icons as any)[iconName];
                                            return (
                                                <button
                                                    key={iconName}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon_name: iconName })}
                                                    className={`p-3 rounded-lg flex items-center justify-center transition-all ${formData.icon_name === iconName
                                                        ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500'
                                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                                        }`}
                                                >
                                                    <Icon className="w-6 h-6" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900"
                                    placeholder="Category name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900"
                                    placeholder="Category description (optional)"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
