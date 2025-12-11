'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

interface Banner {
    id: number;
    title: string;
    subtitle?: string;
    button_text?: string;
    button_link?: string;
    bg_color?: string;
    position: string | string[];
    is_active?: boolean;
}

export default function PromoStrip() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await api.get('/banners');
                const allBanners = response.data.data || response.data;
                // Get ALL banners with promo_strip position
                const promoStripBanners = allBanners.filter((b: Banner) => {
                    const positions = Array.isArray(b.position) ? b.position : [b.position];
                    return positions.includes('promo_strip') && b.is_active !== false;
                });
                setBanners(promoStripBanners);
            } catch (error) {
                console.error('Error fetching promo strip:', error);
            }
        };

        fetchBanners();
    }, []);

    // Auto-rotate banners every 5 seconds if there are multiple
    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    if (banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    return (
        <div className="relative w-full bg-gradient-to-r from-primary via-accent to-primary text-white overflow-hidden">
            {/* Animated shimmer effect */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s infinite linear'
                }}
            />

            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            <div className="container mx-auto px-4 py-3 relative z-10">
                <div className="flex items-center justify-center sm:justify-between gap-4">
                    {/* Main content - centered on mobile, left on desktop */}
                    <div className="flex items-center gap-3 text-center sm:text-left">
                        {/* Icon */}
                        <div className="hidden sm:flex items-center justify-center w-6 h-6 bg-white/20 rounded-full flex-shrink-0">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 1 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                            </svg>
                        </div>

                        {/* Text */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-bold text-sm sm:text-base">
                                {currentBanner.title}
                            </span>
                            {currentBanner.subtitle && (
                                <>
                                    <span className="hidden sm:inline text-white/70">•</span>
                                    <span className="text-xs sm:text-sm text-white/90">
                                        {currentBanner.subtitle}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right side - CTA only */}
                    {currentBanner.button_text && currentBanner.button_link && (
                        <div className="hidden sm:block">
                            <Link
                                href={currentBanner.button_link}
                                className="group inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-primary rounded-full text-sm font-semibold hover:bg-white/90 transition-all shadow-md hover:shadow-lg"
                            >
                                <span>{currentBanner.button_text}</span>
                                <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
