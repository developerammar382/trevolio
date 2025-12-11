'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiSmartphone, FiMonitor, FiWatch, FiHeadphones, FiCamera, FiGrid, FiFolder } from 'react-icons/fi';
import api from '@/lib/api';

interface Category {
    id: number;
    name: string;
    slug: string;
    products_count?: number;
}

export default function FeaturedCategories() {
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

    if (loading) return null;
    if (categories.length === 0) return null;

    // Take only first 6 categories
    const displayCategories = categories.slice(0, 6);

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Shop by Category</h2>
                    <p className="text-slate-600">Explore our wide range of premium collections</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {displayCategories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                href={`/categories/${category.id}`}
                                className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-accent transition-all hover:shadow-lg text-center h-full"
                            >
                                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 bg-secondary text-primary">
                                    <FiFolder className="w-8 h-8" />
                                </div>
                                <h3 className="font-medium text-slate-900 group-hover:text-primary transition-colors truncate">
                                    {category.name}
                                </h3>
                                {category.products_count !== undefined && (
                                    <p className="text-xs text-slate-500 mt-1">{category.products_count} items</p>
                                )}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
