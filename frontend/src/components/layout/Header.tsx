'use client';

import Link from 'next/link';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useCurrency } from '@/hooks/useCurrency';
import CurrencySelector from '@/components/ui/CurrencySelector';
import SearchModal from '@/components/search/SearchModal';

export default function Header() {
    const { cartCount } = useCart();
    const { user, logout, isAuthenticated } = useAuth();
    const { settings } = useSettings();
    const { formatPrice } = useCurrency();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const pathname = usePathname();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
        setSearchQuery('');
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        if (isSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSearchOpen]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 1) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const performSearch = async () => {
        setIsSearching(true);
        try {
            // Use the public API endpoint for products
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/search?q=${searchQuery}`);
            const data = await response.json();
            setSearchResults(data.data || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Shop' },
        { href: '/categories', label: 'Categories' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' },
    ];

    const siteName = settings.site_name || 'Trevolio';
    const firstLetter = siteName.charAt(0).toUpperCase();

    return (
        <header
            className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen || isSearchOpen ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm' : 'bg-white/80 backdrop-blur-sm'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-4 md:py-0 min-h-[5rem] md:min-h-[10rem]">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold font-heading text-primary flex items-center gap-2">
                        {settings.show_logo === '1' && settings.site_logo_url ? (
                            <div className="relative h-12 md:h-40 w-auto transition-all duration-300">
                                <img
                                    src={settings.site_logo_url}
                                    alt={siteName}
                                    className="h-full w-auto object-contain"
                                />
                            </div>
                        ) : (
                            <>
                                <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold font-heading">{firstLetter}</span>
                                <span className="tracking-tight">{siteName}</span>
                            </>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-accent ${pathname === link.href ? 'text-accent font-semibold' : 'text-primary/80'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 text-primary/80 hover:text-accent transition-colors"
                            >
                                <FiSearch className="w-5 h-5" />
                            </button>
                            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                        </div>

                        <CurrencySelector />

                        <Link href="/wishlist" className="p-2 text-primary/80 hover:text-accent transition-colors">
                            <FiHeart className="w-5 h-5" />
                        </Link>

                        <Link href="/cart" className="p-2 text-primary/80 hover:text-accent transition-colors relative">
                            <FiShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <NotificationDropdown />
                                <div className="relative group">
                                    <button className="flex items-center gap-2 text-sm font-medium text-primary/80 hover:text-primary transition-colors">
                                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-primary">
                                            <FiUser className="w-4 h-4" />
                                        </div>
                                        <span>{user?.name}</span>
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                                        <div className="p-2 space-y-1">
                                            <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={logout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-primary"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-100 bg-white"
                    >
                        <div className="container mx-auto px-4 py-4 space-y-4">
                            {/* Mobile Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />

                                {searchResults.length > 0 && searchQuery.length > 1 && (
                                    <div className="mt-2 bg-white rounded-lg border border-slate-100 shadow-lg max-h-60 overflow-y-auto">
                                        {searchResults.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/products/${product.slug}`}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="w-8 h-8 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img src={product.images[0].image_url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <FiSearch className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-slate-900 truncate">{product.name}</h4>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block py-2 text-base font-medium ${pathname === link.href ? 'text-accent' : 'text-primary/80'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-slate-100">
                                <CurrencySelector />
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <Link href="/cart" className="flex items-center gap-2 text-primary/80">
                                    <FiShoppingCart className="w-5 h-5" />
                                    Cart ({cartCount})
                                </Link>
                                <Link href="/wishlist" className="flex items-center gap-2 text-primary/80">
                                    <FiHeart className="w-5 h-5" />
                                    Wishlist
                                </Link>
                                {isAuthenticated ? (
                                    <>
                                        <Link href="/dashboard" className="flex items-center gap-2 text-primary/80">
                                            <FiUser className="w-5 h-5" />
                                            Dashboard
                                        </Link>
                                        <button onClick={logout} className="flex items-center gap-2 text-red-500">
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link href="/login" className="block w-full py-3 bg-primary text-white text-center rounded-xl font-medium shadow-md">
                                        Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header >
    );
}
