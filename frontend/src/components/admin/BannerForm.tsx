'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FiSave, FiArrowLeft, FiUpload } from 'react-icons/fi';
import Link from 'next/link';

interface BannerFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function BannerForm({ initialData, isEditing = false }: BannerFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image_url: '',
        button_text: '',
        button_link: '',
        bg_color: '#000000',
        position: ['popup'],
        show_gradient: false,
        is_active: true,
        order_index: 0,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePositionToggle = (pos: string) => {
        setFormData(prev => {
            const currentPositions = prev.position;
            if (currentPositions.includes(pos)) {
                return { ...prev, position: currentPositions.filter(p => p !== pos) };
            } else {
                return { ...prev, position: [...currentPositions, pos] };
            }
        });
    };

    useEffect(() => {
        if (initialData) {
            // Handle position - could be string or array
            let positions = initialData.position || ['popup'];
            if (typeof positions === 'string') {
                positions = [positions];
            }

            setFormData({
                title: initialData.title || '',
                subtitle: initialData.subtitle || '',
                image_url: initialData.image_url || '',
                button_text: initialData.button_text || '',
                button_link: initialData.button_link || '',
                bg_color: initialData.bg_color || '#000000',
                position: positions,
                show_gradient: initialData.show_gradient || false,
                is_active: initialData.is_active ?? true,
                order_index: initialData.order_index || 0,
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('subtitle', formData.subtitle);
            data.append('button_text', formData.button_text);
            data.append('button_link', formData.button_link);
            data.append('bg_color', formData.bg_color);
            data.append('position', JSON.stringify(formData.position)); // Send as JSON
            data.append('show_gradient', formData.show_gradient ? '1' : '0');
            data.append('is_active', formData.is_active ? '1' : '0');
            data.append('order_index', String(formData.order_index));

            if (imageFile) {
                data.append('image', imageFile);
            } else if (formData.image_url) {
                data.append('image_url', formData.image_url);
            }

            if (isEditing) {
                data.append('_method', 'PUT'); // Spoof PUT for FormData
                await api.post(`/admin/banners/${initialData.id}`, data);
                toast.success('Banner updated successfully');
            } else {
                await api.post('/admin/banners', data);
                toast.success('Banner created successfully');
            }
            router.push('/admin/banners');
        } catch (error: any) {
            console.error('Error saving banner:', error);
            toast.error(error.response?.data?.message || 'Failed to save banner');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/banners"
                        className="p-2 rounded-full hover:bg-accent transition-colors"
                    >
                        <FiArrowLeft className="w-6 h-6 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {isEditing ? 'Edit Banner' : 'Create Banner'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isEditing ? 'Update banner details' : 'Add a new banner to your site'}
                        </p>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                >
                    <FiSave className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Banner'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Banner Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-2">Subtitle</label>
                                <textarea
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    rows={2}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-2">Banner Image</label>
                                <div className="space-y-4">
                                    {/* Image Preview */}
                                    {(imagePreview || formData.image_url) && (
                                        <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border border-border">
                                            <img
                                                src={imagePreview || formData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* File Input */}
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors">
                                            <FiUpload className="w-4 h-4" />
                                            <span>Choose Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                        <span className="text-sm text-muted-foreground">
                                            {imageFile ? imageFile.name : 'No file chosen'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Recommended size: 1920x600px for Hero, 800x600px for Popup. Max 2MB.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Button Text</label>
                                <input
                                    type="text"
                                    value={formData.button_text}
                                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Button Link</label>
                                <input
                                    type="text"
                                    value={formData.button_link}
                                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Settings</h3>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3">Display Position</label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.position.includes('popup')}
                                        onChange={() => handlePositionToggle('popup')}
                                        className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary/20"
                                    />
                                    <div>
                                        <div className="font-medium text-foreground">Popup Modal</div>
                                        <div className="text-xs text-muted-foreground">Appears on first visit</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.position.includes('promo_strip')}
                                        onChange={() => handlePositionToggle('promo_strip')}
                                        className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary/20"
                                    />
                                    <div>
                                        <div className="font-medium text-foreground">Promo Strip</div>
                                        <div className="text-xs text-muted-foreground">Thin bar at the top</div>
                                    </div>
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Select one or both positions where this banner should appear.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Background Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={formData.bg_color}
                                    onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                                    className="h-10 w-20 rounded cursor-pointer border border-input"
                                />
                                <input
                                    type="text"
                                    value={formData.bg_color}
                                    onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                                    className="flex-1 px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                            <span className="text-sm font-medium text-foreground">Active Status</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                            <span className="text-sm font-medium text-foreground">Show Gradient</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.show_gradient}
                                    onChange={(e) => setFormData({ ...formData, show_gradient: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
