'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FiCheck } from 'react-icons/fi';

interface Variant {
    name: string;
    type?: 'color' | 'size' | 'other';
    options: string[];
}

interface ProductVariantsProps {
    variants: Variant[];
    onVariantChange?: (selected: Record<string, string>) => void;
}

export default function ProductVariants({ variants, onVariantChange }: ProductVariantsProps) {
    const [selections, setSelections] = useState<Record<string, string>>({});

    // Initialize selections with first options
    useEffect(() => {
        if (variants && variants.length > 0) {
            const initialSelections: Record<string, string> = {};
            variants.forEach(variant => {
                if (variant.options.length > 0) {
                    initialSelections[variant.name] = variant.options[0];
                }
            });
            setSelections(initialSelections);
            if (onVariantChange) {
                onVariantChange(initialSelections);
            }
        }
    }, [variants]);

    const handleSelection = (variantName: string, option: string) => {
        const newSelections = { ...selections, [variantName]: option };
        setSelections(newSelections);
        if (onVariantChange) {
            onVariantChange(newSelections);
        }
    };

    if (!variants || variants.length === 0) return null;

    return (
        <div className="space-y-6">
            {variants.map((variant, idx) => (
                <div key={idx} className="space-y-3">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        {variant.name}:
                        <span className="text-muted-foreground font-normal">
                            {variant.type === 'color'
                                ? <span className="inline-block w-3 h-3 rounded-full border border-border ml-1" style={{ backgroundColor: selections[variant.name] }}></span>
                                : selections[variant.name]
                            }
                        </span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {variant.options.map((option, optIdx) => {
                            const isSelected = selections[variant.name] === option;

                            if (variant.type === 'color') {
                                return (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleSelection(variant.name, option)}
                                        className={cn(
                                            "w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center relative",
                                            isSelected
                                                ? "border-primary ring-2 ring-primary/20 ring-offset-2"
                                                : "border-transparent hover:scale-110"
                                        )}
                                        style={{ backgroundColor: option }}
                                        title={option}
                                    >
                                        {isSelected && (
                                            <FiCheck className={cn(
                                                "w-4 h-4",
                                                // Use white check for dark colors, black for light colors
                                                // Simple heuristic: if hex is light, use black text
                                                isLightColor(option) ? "text-black" : "text-white"
                                            )} />
                                        )}
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={optIdx}
                                    onClick={() => handleSelection(variant.name, option)}
                                    className={cn(
                                        "min-w-[3rem] px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200",
                                        isSelected
                                            ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                            : "border-border bg-white hover:border-primary/50 text-slate-700 hover:bg-slate-50"
                                    )}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Helper to determine if a color is light or dark
function isLightColor(color: string) {
    // Basic check for hex codes
    if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return brightness > 155;
    }
    // Fallback for named colors (simplified)
    const lightColors = ['white', 'yellow', 'cream', 'beige', 'light'];
    return lightColors.some(c => color.toLowerCase().includes(c));
}
