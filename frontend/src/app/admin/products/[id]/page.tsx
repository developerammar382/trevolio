'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProduct({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/admin/products/${params.id}`);
                setProduct(response.data.data || response.data);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return <div>Product not found</div>;
    }

    return <ProductForm initialData={product} isEditing />;
}
