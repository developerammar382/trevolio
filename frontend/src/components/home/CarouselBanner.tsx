'use client';

import { useEffect, useState } from 'react';
import CarouselClient from './CarouselClient';
import CarouselSkeleton from './CarouselSkeleton';

interface Banner {
    id: number;
    title: string;
    subtitle: string;
    image_url: string;
    button_text: string;
    button_link: string;
    bg_color: string;
    position?: string | string[];
}

export default function CarouselBanner() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBanners() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banners`, {
                    cache: 'no-store',
                });
                if (!res.ok) throw new Error('Failed to fetch banners');
                const data = await res.json();

                // Filter for hero banners only
                const heroBanners = data.filter((banner: Banner) => {
                    const positions = Array.isArray(banner.position)
                        ? banner.position
                        : [banner.position || 'hero'];
                    return positions.includes('hero');
                });

                setBanners(heroBanners);
            } catch (error) {
                console.error('Error fetching banners:', error);
                setBanners([]);
            } finally {
                setLoading(false);
            }
        }
        fetchBanners();
    }, []);

    if (loading) return <CarouselSkeleton />;
    return <CarouselClient initialSlides={banners} />;
}
