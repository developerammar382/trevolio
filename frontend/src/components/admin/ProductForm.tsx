'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiUpload, FiSave, FiArrowLeft, FiX, FiPlus, FiTrash2, FiImage, FiBox, FiTag, FiDollarSign, FiLayers } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
}

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
}

interface Variant {
    name: string;
    type: 'color' | 'size' | 'other';
    options: string[];
}

export default function ProductForm({ initialData, isEditing }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || '',
        sale_price: initialData?.sale_price || '',
        stock: initialData?.stock_quantity || initialData?.stock || '',
        sku: initialData?.sku || '',
        category_id: initialData?.category_id || '',
        is_active: initialData?.is_active ?? true,
        is_featured: initialData?.is_featured ?? false,
        meta_title: initialData?.meta_title || '',
        meta_description: initialData?.meta_description || '',
        meta_keywords: initialData?.meta_keywords || '',
        variants: (initialData?.variants || []) as Variant[],
    });

    // Parse initial images
    const [existingImages, setExistingImages] = useState<string[]>(() => {
        if (!initialData?.images) return [];
        return Array.isArray(initialData.images) ? initialData.images : JSON.parse(initialData.images);
    });

    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            const categoriesData = response.data.data || response.data;
            setCategories(categoriesData);
        } catch (error) {
            console.error('ProductForm - Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            setNewImages(prev => [...prev, ...newFiles]);

            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const addVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { name: '', type: 'size', options: [] }]
        });
    };

    const updateVariant = (index: number, field: keyof Variant, value: any) => {
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData({ ...formData, variants: newVariants });
    };

    const removeVariant = (index: number) => {
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData({ ...formData, variants: newVariants });
    };

    const addOption = (variantIndex: number, option: string) => {
        if (!option.trim()) return;
        const newVariants = [...formData.variants];
        if (!newVariants[variantIndex].options.includes(option)) {
            newVariants[variantIndex].options.push(option);
            setFormData({ ...formData, variants: newVariants });
        }
    };

    const removeOption = (variantIndex: number, optionIndex: number) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex);
        setFormData({ ...formData, variants: newVariants });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            // Basic fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'variants' && key !== 'images') {
                    if (typeof value === 'boolean') {
                        data.append(key, value ? '1' : '0');
                    } else {
                        data.append(key, String(value));
                    }
                }
            });

            // Variants
            formData.variants.forEach((variant, index) => {
                data.append(`variants[${index}][name]`, variant.name);
                data.append(`variants[${index}][type]`, variant.type);
                variant.options.forEach((option, optIndex) => {
                    data.append(`variants[${index}][options][${optIndex}]`, option);
                });
            });

            // Images
            existingImages.forEach(img => data.append('existing_images[]', img));
            newImages.forEach(file => data.append('images[]', file));

            if (isEditing) {
                data.append('_method', 'PUT');
                await api.post(`/admin/products/${initialData.id}`, data);
                toast.success('Product updated successfully');
            } else {
                await api.post('/admin/products', data);
                toast.success('Product created successfully');
            }

            router.push('/admin/products');
            router.refresh();
        } catch (error: any) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 border-b border-border/40">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 rounded-full hover:bg-accent transition-colors">
                        <FiArrowLeft className="w-6 h-6 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isEditing ? 'Edit Product' : 'New Product'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditing ? 'Update product details' : 'Add a new product to your catalog'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/products" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        <FiSave className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info Card */}
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border/50 bg-muted/30 flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <FiBox className="w-5 h-5" />
                            </div>
                            <h2 className="font-semibold text-lg">Product Information</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="e.g. Premium Cotton T-Shirt"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    placeholder="Describe your product..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media Card */}
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border/50 bg-muted/30 flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                <FiImage className="w-5 h-5" />
                            </div>
                            <h2 className="font-semibold text-lg">Media</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                {existingImages.map((img, idx) => (
                                    <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-muted">
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`}
                                            alt={`Product ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(idx)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                        >
                                            <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {newImagePreviews.map((preview, idx) => (
                                    <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-muted">
                                        <img
                                            src={preview}
                                            alt={`New ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(idx)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                        >
                                            <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                                    <FiUpload className="w-6 h-6" />
                                    <span className="text-xs font-medium">Upload</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Variants Card */}
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border/50 bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                    <FiLayers className="w-5 h-5" />
                                </div>
                                <h2 className="font-semibold text-lg">Variants</h2>
                            </div>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                            >
                                <FiPlus className="w-4 h-4" /> Add Variant
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {formData.variants.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                                    <p>No variants added yet.</p>
                                    <p className="text-sm mt-1">Add variants like Size or Color to your product.</p>
                                </div>
                            ) : (
                                formData.variants.map((variant, vIndex) => (
                                    <div key={vIndex} className="p-5 bg-muted/20 rounded-xl border border-border/60 space-y-4">
                                        <div className="flex gap-4 items-start">
                                            <div className="flex-1 grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-muted-foreground">Type</label>
                                                    <select
                                                        value={variant.type}
                                                        onChange={(e) => updateVariant(vIndex, 'type', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                                                    >
                                                        <option value="size">Size</option>
                                                        <option value="color">Color</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                                                    <input
                                                        type="text"
                                                        value={variant.name}
                                                        onChange={(e) => updateVariant(vIndex, 'name', e.target.value)}
                                                        placeholder={variant.type === 'color' ? 'Color' : 'Size'}
                                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(vIndex)}
                                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mt-6"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground">Options</label>
                                            <div className="flex flex-wrap gap-2">
                                                {variant.options.map((option, oIndex) => (
                                                    <span key={oIndex} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full text-sm shadow-sm">
                                                        {variant.type === 'color' && (
                                                            <span className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: option }}></span>
                                                        )}
                                                        {option}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(vIndex, oIndex)}
                                                            className="hover:text-red-500 transition-colors ml-1"
                                                        >
                                                            <FiX className="w-3.5 h-3.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                                <div className="relative flex items-center">
                                                    {variant.type === 'color' ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="color"
                                                                onChange={(e) => addOption(vIndex, e.target.value)}
                                                                className="w-8 h-8 rounded cursor-pointer border-0 p-0 overflow-hidden"
                                                            />
                                                            <span className="text-xs text-muted-foreground">Pick color</span>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            placeholder="Type & Enter"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    addOption(vIndex, e.currentTarget.value);
                                                                    e.currentTarget.value = '';
                                                                }
                                                            }}
                                                            className="w-32 px-3 py-1.5 rounded-full border border-input bg-background text-sm focus:w-48 transition-all"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Settings */}
                <div className="space-y-8">
                    {/* Status Card */}
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border/50 bg-muted/30 flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <FiTag className="w-5 h-5" />
                            </div>
                            <h2 className="font-semibold text-lg">Status & Category</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
                                <span className="text-sm font-medium">Active Status</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={cn(
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                        formData.is_active ? "bg-primary" : "bg-muted"
                                    )}
                                >
                                    <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", formData.is_active ? "translate-x-6" : "translate-x-1")} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
                                <span className="text-sm font-medium">Featured Product</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                                    className={cn(
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                        formData.is_featured ? "bg-amber-500" : "bg-muted"
                                    )}
                                >
                                    <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", formData.is_featured ? "translate-x-6" : "translate-x-1")} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    required
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border/50 bg-muted/30 flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                <FiDollarSign className="w-5 h-5" />
                            </div>
                            <h2 className="font-semibold text-lg">Pricing & Inventory</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Sale Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.sale_price}
                                            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock Quantity</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">SKU</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="PROD-001"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, sku: 'PROD-' + Math.floor(100000 + Math.random() * 900000) })}
                                        className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-xl text-xs font-medium transition-colors"
                                    >
                                        Auto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
