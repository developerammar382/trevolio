'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatPrice, getCurrencySymbol, convertPrice } from '@/lib/currency';

const USER_CURRENCY_KEY = 'user_preferred_currency';

interface CurrencyContextType {
    currency: 'PKR' | 'USD';
    exchangeRate: number;
    formatPrice: (amount: number) => string;
    getCurrencySymbol: () => string;
    convertPrice: (amountInPKR: number) => number;
    setUserCurrency: (currency: 'PKR' | 'USD') => void;
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');
    const [exchangeRate, setExchangeRate] = useState<number>(280);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrencySettings();
    }, []);

    const fetchCurrencySettings = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/public`);
            if (response.ok) {
                const data = await response.json();
                const adminCurrency = data.currency || 'PKR';
                const rate = data.exchange_rate || 280;

                setExchangeRate(rate);

                // Check for user preference in localStorage
                const userPreference = localStorage.getItem(USER_CURRENCY_KEY) as 'PKR' | 'USD' | null;

                // Priority: User preference > Admin default
                if (userPreference && (userPreference === 'PKR' || userPreference === 'USD')) {
                    setCurrency(userPreference);
                } else {
                    setCurrency(adminCurrency);
                }
            }
        } catch (error) {
            console.error('Failed to fetch currency settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const setUserCurrency = React.useCallback((newCurrency: 'PKR' | 'USD') => {
        setCurrency(newCurrency);
        localStorage.setItem(USER_CURRENCY_KEY, newCurrency);
    }, []);

    const formatPriceWithCurrency = React.useCallback((amount: number) => {
        return formatPrice(amount, currency, exchangeRate);
    }, [currency, exchangeRate]);

    const getSymbol = React.useCallback(() => {
        return getCurrencySymbol(currency);
    }, [currency]);

    const convertPriceWithRate = React.useCallback((amountInPKR: number) => {
        return convertPrice(amountInPKR, currency, exchangeRate);
    }, [currency, exchangeRate]);

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                exchangeRate,
                formatPrice: formatPriceWithCurrency,
                getCurrencySymbol: getSymbol,
                convertPrice: convertPriceWithRate,
                setUserCurrency,
                loading,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
