/**
 * Currency utility functions
 */

export interface CurrencySettings {
    currency: 'PKR' | 'USD';
    exchange_rate: number;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(
    amount: number | string,
    currency: 'PKR' | 'USD' = 'PKR',
    exchangeRate: number = 280
): string {
    // Handle null, undefined, or invalid values
    if (amount === null || amount === undefined || amount === '') {
        return `${currency === 'PKR' ? 'Rs' : '$'} 0.00`;
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Handle NaN
    if (isNaN(numAmount)) {
        return `${currency === 'PKR' ? 'Rs' : '$'} 0.00`;
    }

    const convertedAmount = currency === 'USD' ? numAmount / exchangeRate : numAmount;
    const symbol = currency === 'PKR' ? 'Rs' : '$';

    return `${symbol} ${convertedAmount.toFixed(2)}`;
}

/**
 * Convert price from PKR to specified currency
 */
export function convertPrice(
    amountInPKR: number,
    targetCurrency: 'PKR' | 'USD',
    exchangeRate: number
): number {
    if (targetCurrency === 'USD') {
        return amountInPKR / exchangeRate;
    }
    return amountInPKR;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: 'PKR' | 'USD'): string {
    return currency === 'PKR' ? 'Rs' : '$';
}
