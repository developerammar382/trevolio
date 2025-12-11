'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
    site_name?: string;
    site_description?: string;
    site_email?: string;
    site_phone?: string;
    currency?: string;
    tax_rate?: string;
    shipping_fee?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    site_logo?: string;
    site_logo_url?: string;
    footer_logo?: string;
    footer_logo_url?: string;
    show_logo?: string;
}

interface SettingsContextType {
    settings: Settings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                cache: 'no-store' // Always fetch fresh settings
            });
            if (!res.ok) throw new Error('Failed to fetch settings');
            const data = await res.json();

            // Flatten the grouped settings
            const flatSettings: Settings = {};
            if (data.data) {
                Object.keys(data.data).forEach((key) => {
                    flatSettings[key as keyof Settings] = data.data[key];
                });
            }

            setSettings(flatSettings);
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Set defaults
            setSettings({
                site_name: 'Trevolio',
                site_description: 'Your one-stop shop for amazing products',
                site_email: 'contact@trevolio.com',
                site_phone: '+1 234 567 8900',
                currency: 'Rs.',
                tax_rate: '0',
                shipping_fee: '0',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const refreshSettings = async () => {
        setLoading(true);
        await fetchSettings();
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
