'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
    console.error("Stripe Publishable Key is missing. Make sure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in your .env.local file.");
}
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface StripeProviderProps {
    children: ReactNode;
    clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
    if (!clientSecret || !stripePromise) {
        return <>{children}</>;
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#31476B',
            },
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            {children}
        </Elements>
    );
}
