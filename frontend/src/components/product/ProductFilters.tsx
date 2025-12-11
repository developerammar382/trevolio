'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Slider } from '@/components/ui/slider';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
    slug: string;
    products_count?: number;
}

interface FilterMetadata {
    min_price: number;
    max_price: number;
}

export default function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [categories, setCategories] = useState<Category[]>([]);
    const [metadata, setMetadata] = useState<FilterMetadata>({ min_price: 0, max_price: 10000 });
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        sort: true
    });

    // Initialize state from URL
    useEffect(() => {
        const min = Number(searchParams.get('min_price')) || metadata.min_price;
        const max = Number(searchParams.get('max_price')) || metadata.max_price;
        setPriceRange([min, max]);
        setSelectedCategory(searchParams.get('category') || '');
        setSelectedSort(searchParams.get('sort') || 'newest');
    }, [searchParams, metadata]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, metaRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/products/filter-metadata')
                ]);
                setCategories(catsRes.data.data || catsRes.data || []);
                setMetadata(metaRes.data);

                // Only set initial price range if not in URL
                if (!searchParams.has('min_price') && !searchParams.has('max_price')) {
                    setPriceRange([metaRes.data.min_price, metaRes.data.max_price]);
                }
            } catch (error) {
                console.error('Error fetching filter data:', error);
            }
        };
        fetchData();
    }, []);

    const applyFilters = (newPriceRange?: [number, number], newCategory?: string, newSort?: string) => {
        const params = new URLSearchParams(searchParams.toString());

        // Price
        const [min, max] = newPriceRange || priceRange;
        if (min > metadata.min_price) params.set('min_price', min.toString());
        else params.delete('min_price');

        if (max < metadata.max_price) params.set('max_price', max.toString());
        else params.delete('max_price');

        // Category
        const cat = newCategory !== undefined ? newCategory : selectedCategory;
        if (cat) params.set('category', cat);
        else params.delete('category');

        // Sort
        const sort = newSort || selectedSort;
        if (sort && sort !== 'newest') params.set('sort', sort);
        else params.delete('sort');

        // Reset page
        params.delete('page');

        router.push(`/products?${params.toString()}`);
    };

    const handlePriceChange = (value: number[]) => {
        setPriceRange([value[0], value[1]]);
    };

    const handlePriceCommit = (value: number[]) => {
        applyFilters([value[0], value[1]], undefined, undefined);
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        applyFilters(undefined, categoryId, undefined);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sort = e.target.value;
        setSelectedSort(sort);
        applyFilters(undefined, undefined, sort);
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange([metadata.min_price, metadata.max_price]);
        setSelectedSort('newest');
        router.push('/products');
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const activeFiltersCount = [
        selectedCategory,
        priceRange[0] > metadata.min_price || priceRange[1] < metadata.max_price,
        selectedSort !== 'newest'
    ].filter(Boolean).length;

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Filter Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg shadow-sm hover:bg-accent transition-colors text-sm font-medium"
            >
                <FiFilter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Filter Drawer Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Filter Drawer */}
            <div className={cn(
                "fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <FiFilter className="w-5 h-5" />
                            Filters
                        </h2>
                        <div className="flex items-center gap-2">
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Reset
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-accent rounded-full transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Sort Section */}
                        <div className="pb-6 border-b border-border">
                            <button
                                onClick={() => toggleSection('sort')}
                                className="flex items-center justify-between w-full mb-4"
                            >
                                <h3 className="font-semibold text-foreground">Sort By</h3>
                                {expandedSections.sort ? <FiChevronUp /> : <FiChevronDown />}
                            </button>

                            {expandedSections.sort && (
                                <select
                                    value={selectedSort}
                                    onChange={handleSortChange}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="popular">Most Popular</option>
                                </select>
                            )}
                        </div>

                        {/* Price Range Section */}
                        <div className="pb-6 border-b border-border">
                            <button
                                onClick={() => toggleSection('price')}
                                className="flex items-center justify-between w-full mb-4"
                            >
                                <h3 className="font-semibold text-foreground">Price Range</h3>
                                {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
                            </button>

                            {expandedSections.price && (
                                <div className="px-2">
                                    <Slider
                                        defaultValue={[metadata.min_price, metadata.max_price]}
                                        value={[priceRange[0], priceRange[1]]}
                                        min={metadata.min_price}
                                        max={metadata.max_price}
                                        step={10}
                                        onValueChange={handlePriceChange}
                                        onValueCommit={handlePriceCommit}
                                        className="mb-6"
                                    />
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="px-3 py-1 rounded border border-border bg-muted">
                                            Rs. {priceRange[0]}
                                        </div>
                                        <span className="text-muted-foreground">-</span>
                                        <div className="px-3 py-1 rounded border border-border bg-muted">
                                            Rs. {priceRange[1]}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Categories Section */}
                        <div>
                            <button
                                onClick={() => toggleSection('categories')}
                                className="flex items-center justify-between w-full mb-4"
                            >
                                <h3 className="font-semibold text-foreground">Categories</h3>
                                {expandedSections.categories ? <FiChevronUp /> : <FiChevronDown />}
                            </button>

                            {expandedSections.categories && (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    <button
                                        onClick={() => handleCategoryChange('')}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg transition-colors text-sm",
                                            selectedCategory === ''
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        )}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryChange(String(category.id))}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg transition-colors text-sm flex justify-between items-center",
                                                selectedCategory === String(category.id)
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                            )}
                                        >
                                            <span>{category.name}</span>
                                            {category.products_count !== undefined && (
                                                <span className="text-xs opacity-70">({category.products_count})</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-6 border-t border-border bg-muted/50">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
