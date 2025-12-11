'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { FiChevronDown } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CurrencySelector() {
    const { currency, setUserCurrency } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currencies = [
        { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs' },
        { code: 'USD', name: 'US Dollar', symbol: '$' },
    ] as const;

    const currentCurrency = currencies.find(c => c.code === currency);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleCurrencyChange = (newCurrency: 'PKR' | 'USD') => {
        setUserCurrency(newCurrency);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary/80 hover:text-accent transition-colors rounded-lg hover:bg-slate-50"
                aria-label="Select currency"
            >
                <span className="font-semibold">{currentCurrency?.symbol}</span>
                <span className="hidden sm:inline">{currentCurrency?.code}</span>
                <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                    >
                        <div className="py-2">
                            {currencies.map((curr) => (
                                <button
                                    key={curr.code}
                                    onClick={() => handleCurrencyChange(curr.code)}
                                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${currency === curr.code
                                            ? 'bg-primary/5 text-primary font-medium'
                                            : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-semibold w-6">{curr.symbol}</span>
                                        <div>
                                            <div className="font-medium">{curr.code}</div>
                                            <div className="text-xs text-slate-500">{curr.name}</div>
                                        </div>
                                    </div>
                                    {currency === curr.code && (
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
