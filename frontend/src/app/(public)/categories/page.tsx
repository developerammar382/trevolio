'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import * as Icons from 'react-icons/fi';
import { FiFolder, FiImage } from 'react-icons/fi';

interface Category {
    id: number;
    name: string;
    description?: string;
    slug: string;
    products_count?: number;
    icon_type?: 'image' | 'icon';
    icon_name?: string;
    icon_url?: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories(res.data.data || res.data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const renderIcon = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName];
        return IconComponent ? <IconComponent className="w-6 h-6" /> : <FiFolder className="w-6 h-6" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-slate-600">Loading categories...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="bg-primary text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
                    <p className="text-white/80 text-lg">Browse our collection of products organized by category</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <Link
                                href={`/categories/${category.id}`}
                                key={category.id}
                                className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-accent transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    {category.icon_type === 'icon' && category.icon_name ? (
                                        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            {renderIcon(category.icon_name)}
                                        </div>
                                    ) : category.icon_url || (category as any).icon_path ? (
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-100">
                                            <Image
                                                src={category.icon_url || `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${(category as any).icon_path}`}
                                                alt={category.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <FiFolder className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors mb-1">
                                            {category.name}
                                        </h3>
                                        {category.description && (
                                            <p className="text-sm text-slate-600 line-clamp-2">{category.description}</p>
                                        )}
                                        {category.products_count !== undefined && (
                                            <p className="text-xs text-slate-500 mt-2">{category.products_count} products</p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-slate-600 text-lg">No categories available yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
