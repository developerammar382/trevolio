'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';

interface Slide {
    id: number;
    title: string;
    subtitle: string;
    image_url: string;
    button_text: string;
    button_link: string;
    bg_color: string;
    show_gradient: boolean;
    gradient_type: 'preset' | 'custom';
    gradient_start_color?: string;
    gradient_end_color?: string;
    gradient_direction?: string;
}

interface CarouselClientProps {
    initialSlides: Slide[];
}

export default function CarouselClient({ initialSlides }: CarouselClientProps) {
    const [slides] = useState<Slide[]>(initialSlides);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        if (slides.length === 0) return;

        const timer = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(timer);
    }, [currentSlide, slides.length]);

    const nextSlide = () => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index: number) => {
        setDirection(index > currentSlide ? 1 : -1);
        setCurrentSlide(index);
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    if (slides.length === 0) {
        return (
            <div className="relative w-full h-[500px] md:h-[600px] bg-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">No banners available</div>
            </div>
        );
    }

    const getCssDirection = (dir?: string) => {
        if (!dir) return 'to right';
        const map: Record<string, string> = {
            'to-r': 'to right',
            'to-l': 'to left',
            'to-b': 'to bottom',
            'to-t': 'to top',
            'to-tr': 'to top right',
            'to-tl': 'to top left',
            'to-br': 'to bottom right',
            'to-bl': 'to bottom left',
        };
        return map[dir] || dir;
    };

    return (
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-slate-900">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src={slides[currentSlide].image_url}
                            alt={slides[currentSlide].title}
                            className="w-full h-full object-cover"
                        />
                        {slides[currentSlide].show_gradient && (
                            <div
                                className={`absolute inset-0 opacity-60 ${slides[currentSlide].gradient_type === 'preset' ? `bg-gradient-to-r ${slides[currentSlide].bg_color}` : ''}`}
                                style={
                                    slides[currentSlide].gradient_type === 'custom'
                                        ? {
                                            background: `linear-gradient(${getCssDirection(slides[currentSlide].gradient_direction)}, ${slides[currentSlide].gradient_start_color}, ${slides[currentSlide].gradient_end_color})`
                                        }
                                        : undefined
                                }
                            />
                        )}
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex items-center">
                        <div className="container mx-auto px-4">
                            <div className="max-w-2xl text-white">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-5xl md:text-7xl font-bold mb-4 font-heading"
                                >
                                    {slides[currentSlide].title}
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-xl md:text-2xl mb-8 text-white/90 font-light"
                                >
                                    {slides[currentSlide].subtitle}
                                </motion.p>
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Link
                                        href={slides[currentSlide].button_link}
                                        className="inline-block px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/20 hover:scale-105"
                                    >
                                        {slides[currentSlide].button_text}
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all z-10"
                        aria-label="Previous slide"
                    >
                        <FiChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all z-10"
                        aria-label="Next slide"
                    >
                        <FiChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all ${index === currentSlide
                                    ? 'w-12 h-3 bg-white rounded-full'
                                    : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/75'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
