'use client';

import { useEffect, useState } from 'react';
import BannerForm from '@/components/admin/BannerForm';
import api from '@/lib/api';

export default function EditBannerPage({ params }: { params: { id: string } }) {
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                // Since we don't have a show endpoint for banners in the controller yet (oops),
                // we might need to fetch all and find, or add show method.
                // Wait, BannerController usually has show?
                // Checking BannerController... it DOES NOT have a show method in the file I read!
                // It has index, store, update, destroy, reorder.
                // I need to add show method to BannerController or fetch all here.
                // Fetching all is inefficient but works for now.
                // Better: Add show method.

                // For now, let's try to fetch all and find.
                const response = await api.get('/admin/banners');
                const found = response.data.find((b: any) => b.id === Number(params.id));
                setBanner(found);
            } catch (error) {
                console.error('Error fetching banner:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanner();
    }, [params.id]);

    if (loading) return <div>Loading...</div>;
    if (!banner) return <div>Banner not found</div>;

    return <BannerForm initialData={banner} isEditing />;
}
