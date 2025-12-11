'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function HeroSection() {
    return (
        <section className="relative h-[80vh] w-full overflow-hidden bg-background flex items-center">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 z-0" />

            {/* Decorative Circles */}
            <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                            New Collection 2025
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
                            Elevate Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                Lifestyle
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
                            Discover our curated collection of premium products designed to enhance your everyday life. Quality meets style in every piece.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/products"
                                className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium flex items-center gap-2 hover:bg-primary/90 transition-all hover:scale-105"
                            >
                                Shop Now <FiArrowRight />
                            </Link>
                            <Link
                                href="/categories"
                                className="px-8 py-4 bg-card border border-border text-foreground rounded-full font-medium hover:bg-accent transition-all hover:scale-105"
                            >
                                View Categories
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Hero Image/Graphic Placeholder - In a real app, this would be a high-res image */}
            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-[80%] bg-gradient-to-l from-primary/5 to-transparent rounded-l-3xl"
            >
                {/* You can place a featured product image here */}
            </motion.div>
        </section>
    );
}
