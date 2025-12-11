'use client';

import { useCurrency as useCurrencyContext } from '@/context/CurrencyContext';

export function useCurrency() {
    const { formatPrice, getCurrencySymbol, currency, convertPrice, setUserCurrency } = useCurrencyContext();

    return {
        formatPrice,
        getCurrencySymbol,
        currency,
        convertPrice,
        setUserCurrency
    };
}
