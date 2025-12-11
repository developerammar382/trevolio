import ProductGrid from '@/components/product/ProductGrid';

async function getRelatedProducts(slug: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}/recommendations`, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || data;
    } catch (error) {
        console.error('Error fetching related products:', error);
        return [];
    }
}

export default async function RelatedProducts({ slug }: { slug: string }) {
    const products = await getRelatedProducts(slug);

    if (products.length === 0) return null;

    return (
        <div className="mt-20">
            <ProductGrid products={products} title="Related Products" />
        </div>
    );
}
