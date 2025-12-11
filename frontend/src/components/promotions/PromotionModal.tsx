'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { FiX, FiZap } from 'react-icons/fi';
import Link from 'next/link';

interface Banner {
    id: number;
    title: string;
    subtitle?: string;
    image_url: string;
    button_text?: string;
    button_link?: string;
    bg_color?: string;
    position: string | string[];
    is_active?: boolean;
}

export default function PromotionModal() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkAndFetchBanners = async () => {
            const hasSeenPromo = sessionStorage.getItem('hasSeenPromo');
            if (hasSeenPromo) return;

            try {
                const response = await api.get('/banners');
                const allBanners = response.data.data || response.data;
                const popupBanners = allBanners.filter((b: Banner) => {
                    const positions = Array.isArray(b.position) ? b.position : [b.position];
                    return positions.includes('popup') && b.is_active !== false;
                });

                if (popupBanners.length > 0) {
                    setBanners(popupBanners);
                    setTimeout(() => setIsOpen(true), 2000);
                }
            } catch (error) {
                console.error('Error fetching promotion:', error);
            }
        };

        checkAndFetchBanners();
    }, []);

    useEffect(() => {
        if (!isOpen || banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isOpen, banners.length]);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('hasSeenPromo', 'true');
    };

    if (!isOpen || banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
                        >
                            <FiX className="w-6 h-6" />
                        </button>

                        {/* Content Container */}
                        <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="absolute inset-0"
                                >
                                    {/* Image */}
                                    <img
                                        src={currentBanner.image_url}
                                        alt={currentBanner.title}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    {/* Text Content */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 text-white">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2, duration: 0.5 }}
                                            className="space-y-4"
                                        >
                                            <div className="inline-flex items-center gap-2 bg-yellow-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-black shadow-lg w-fit">
                                                <FiZap className="w-3 h-3" />
                                                <span>Limited Offer</span>
                                            </div>

                                            <h2 className="text-3xl sm:text-5xl font-bold leading-tight drop-shadow-lg">
                                                {currentBanner.title}
                                            </h2>

                                            {currentBanner.subtitle && (
                                                <p className="text-lg text-white/90 max-w-xl drop-shadow-md">
                                                    {currentBanner.subtitle}
                                                </p>
                                            )}

                                            {currentBanner.button_text && currentBanner.button_link && (
                                                <div className="pt-4">
                                                    <Link
                                                        href={currentBanner.button_link}
                                                        onClick={handleClose}
                                                        className="inline-flex items-center justify-center px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-100 hover:scale-105 transition-all duration-300 shadow-lg"
                                                    >
                                                        {currentBanner.button_text}
                                                    </Link>
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
