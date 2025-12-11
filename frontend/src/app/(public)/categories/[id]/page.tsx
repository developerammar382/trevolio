import Image from 'next/image';
import * as Icons from 'react-icons/fi';

import { notFound } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';

async function getCategory(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

async function getProducts(categoryId: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?category_id=${categoryId}`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        return [];
    }
}

export default async function CategoryPage({ params }: { params: { id: string } }) {
    const categoryData = await getCategory(params.id);
    const productsData = await getProducts(params.id);

    const category = categoryData?.data || categoryData;
    const products = productsData?.data || productsData || [];

    if (!category) {
        notFound();
    }

    const renderIcon = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName];
        return IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : null;
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="bg-primary text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        {category.icon_type === 'icon' && category.icon_name ? (
                            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                {renderIcon(category.icon_name)}
                            </div>
                        ) : category.icon_url ? (
                            <div className="relative w-16 h-16 bg-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                                <Image
                                    src={category.icon_url}
                                    alt={category.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : null}
                        <h1 className="text-4xl font-bold">{category.name}</h1>
                    </div>
                    {category.description && (
                        <p className="text-white/80 text-lg max-w-2xl">{category.description}</p>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {products.length > 0 ? (
                    <ProductGrid products={products} />
                ) : (
                    <div className="text-center py-20">
                        <p className="text-slate-600 text-lg">No products found in this category yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
