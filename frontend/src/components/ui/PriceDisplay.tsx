'use client';

import { useCurrency } from '@/hooks/useCurrency';

interface PriceDisplayProps {
    amount: number | string;
    className?: string;
}

export default function PriceDisplay({ amount, className = '' }: PriceDisplayProps) {
    const { formatPrice } = useCurrency();

    return <span className={className}>{formatPrice(amount)}</span>;
}
