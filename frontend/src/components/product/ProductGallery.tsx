'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
    images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                No Image Available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div
                className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-border group cursor-zoom-in"
                onMouseMove={(e) => {
                    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - left) / width) * 100;
                    const y = ((e.clientY - top) / height) * 100;
                    e.currentTarget.style.setProperty('--zoom-x', `${x}%`);
                    e.currentTarget.style.setProperty('--zoom-y', `${y}%`);
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full p-4 relative"
                    >
                        <img
                            src={images[selectedImage]}
                            alt="Product Image"
                            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-150 group-hover:origin-[var(--zoom-x)_var(--zoom-y)]"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={cn(
                                "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                                selectedImage === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/50"
                            )}
                        >
                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
