import CarouselBanner from '@/components/home/CarouselBanner';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import ProductGrid from '@/components/product/ProductGrid';

async function getTrendingProducts() {
  try {
    // In a real app, this would be a server-side call or use a specific endpoint
    // For now, we'll fetch products and take the first 8
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { cache: 'no-store' });
    if (!res.ok) {
      console.error('Failed to fetch products:', res.status);
      return [];
    }
    const data = await res.json();
    console.log('API Response:', data); // Debug log
    // API returns paginated data with 'data' array
    return (data.data || []).slice(0, 8);
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return [];
  }
}

export default async function Home() {
  const trendingProducts = await getTrendingProducts();

  return (
    <main className="min-h-screen bg-background">
      {/* Carousel Banner */}
      <CarouselBanner />

      <FeaturedCategories />

      {/* Trending Products */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">New Arrivals</h2>
            <p className="text-muted-foreground text-lg">Discover our latest collection of premium products</p>
          </div>
          <ProductGrid products={trendingProducts} />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-xl text-white/80 mb-10 leading-relaxed">
              Subscribe to our newsletter and be the first to know about new products, exclusive offers, and special promotions.
            </p>
            <form className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105 whitespace-nowrap"
                >
                  Subscribe Now
                </button>
              </div>
              <p className="text-sm text-white/60 mt-4">
                Join 10,000+ subscribers. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
