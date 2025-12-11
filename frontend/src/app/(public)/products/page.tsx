import ProductListing from '@/components/product/ProductListing';
import ProductFilters from '@/components/product/ProductFilters';

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
    try {
        const params = new URLSearchParams();
        if (searchParams.category) params.append('category_id', String(searchParams.category));
        if (searchParams.min_price) params.append('min_price', String(searchParams.min_price));
        if (searchParams.max_price) params.append('max_price', String(searchParams.max_price));
        if (searchParams.sort) params.append('sort', String(searchParams.sort));
        if (searchParams.search) params.append('q', String(searchParams.search)); // Support search param

        // Default per_page to 12
        params.append('per_page', '12');

        // Use search endpoint if search query exists, otherwise standard index
        const endpoint = searchParams.search ? '/products/search' : '/products';

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}?${params.toString()}`, { cache: 'no-store' });

        if (!res.ok) return { data: [], total: 0, current_page: 1, last_page: 1 };
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return { data: [], total: 0, current_page: 1, last_page: 1 };
    }
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const productsData = await getProducts(searchParams);
    const products = productsData.data || [];

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                {/* Page Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-bold text-slate-900 mb-4">Discover Our Collection</h1>
                    <p className="text-xl text-slate-600">Explore premium products curated just for you</p>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex justify-end mb-6">
                            <ProductFilters />
                        </div>

                        <ProductListing
                            initialProducts={products}
                            initialMeta={{
                                current_page: productsData.current_page || 1,
                                last_page: productsData.last_page || 1,
                                total: productsData.total || 0
                            }}
                            searchParams={searchParams}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
