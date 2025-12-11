import ProductGallery from '@/components/product/ProductGallery';
import RelatedProducts from '@/components/product/RelatedProducts';
import ProductActions from '@/components/product/ProductActions';
import ReviewsSection from '@/components/product/ReviewsSection';
import PriceDisplay from '@/components/ui/PriceDisplay';
import { FiTruck, FiShield } from 'react-icons/fi';
import Link from 'next/link';

import { Metadata } from 'next';

async function getProduct(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.data || data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const product = await getProduct(params.id);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    return {
        title: product.meta_title || product.name,
        description: product.meta_description || product.description?.substring(0, 160),
        keywords: product.meta_keywords?.split(',').map((k: string) => k.trim()) || [],
        openGraph: {
            title: product.meta_title || product.name,
            description: product.meta_description || product.description?.substring(0, 160),
            images: product.image_url ? [product.image_url] : [],
        },
    };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                <Link href="/products" className="text-primary hover:underline">
                    Back to Products
                </Link>
            </div>
        );
    }

    // Parse images
    let images: string[] = [];
    if (product.images) {
        images = Array.isArray(product.images) ? product.images : JSON.parse(product.images);
        // Ensure images have full URL
        images = images.map(img => img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`);
    } else if (product.image_url) {
        images = [product.image_url];
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                {/* Gallery */}
                <ProductGallery images={images} />

                {/* Product Info */}
                <div className="space-y-8">
                    <div>
                        <div className="text-sm font-medium text-primary mb-2">
                            {product.category?.name || 'Uncategorized'}
                        </div>
                        <h1 className="text-4xl font-bold text-foreground mb-4">{product.name}</h1>
                        <div className="flex items-center gap-4">
                            <PriceDisplay
                                amount={product.price}
                                className="text-3xl font-bold text-foreground"
                            />
                            {product.stock_quantity > 0 ? (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                    In Stock
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                    Out of Stock
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed text-lg">
                        {product.description}
                    </p>

                    <ProductActions product={product} />

                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-border">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <FiTruck className="w-5 h-5 text-primary" />
                            <span>Free Shipping over $100</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <FiShield className="w-5 h-5 text-primary" />
                            <span>2 Year Warranty</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {product.category_id && (
                <RelatedProducts categoryId={product.category_id} currentProductId={product.id} />
            )}

            {/* Reviews Section */}
            <ReviewsSection productId={product.id} />
        </div>
    );
}
