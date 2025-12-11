'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';
import Link from 'next/link';

interface Banner {
    id: number;
    title: string;
    position: string | string[];
    image_url: string;
    is_active: boolean;
    order_index: number;
}

export default function AdminBanners() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/banners');
            // Filter out hero banners (show only popup, promo_strip, etc.)
            const otherBanners = response.data.filter((b: Banner) => {
                const positions = Array.isArray(b.position) ? b.position : [b.position];
                return !positions.includes('hero');
            });
            setBanners(otherBanners);
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this banner?')) {
            try {
                await api.delete(`/admin/banners/${id}`);
                fetchBanners();
            } catch (error) {
                console.error('Error deleting banner:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Banners</h1>
                    <p className="text-muted-foreground mt-1">Manage your website banners and promotions</p>
                </div>
                <Link
                    href="/admin/banners/create"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors font-medium"
                >
                    <FiPlus /> Add Banner
                </Link>
            </div>

            <DataTable
                isLoading={loading}
                data={banners}
                columns={[
                    {
                        header: 'Image',
                        cell: (item) => (
                            <div className="w-24 h-12 bg-slate-100 rounded overflow-hidden relative">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <FiImage />
                                    </div>
                                )}
                            </div>
                        )
                    },
                    { header: 'Title', accessorKey: 'title', className: 'font-medium text-foreground' },
                    {
                        header: 'Position',
                        cell: (item) => {
                            const positionLabels: Record<string, string> = {
                                'popup': 'Popup Modal',
                                'promo_strip': 'Promo Strip'
                            };
                            const positions = Array.isArray(item.position) ? item.position : [item.position];
                            return (
                                <div className="flex flex-wrap gap-1">
                                    {positions.map((pos: string) => (
                                        <span key={pos} className="capitalize px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                                            {positionLabels[pos] || pos}
                                        </span>
                                    ))}
                                </div>
                            );
                        }
                    },
                    {
                        header: 'Status',
                        cell: (item) => (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {item.is_active ? 'Active' : 'Inactive'}
                            </span>
                        )
                    },
                    {
                        header: 'Actions',
                        className: 'text-right',
                        cell: (item) => (
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); router.push(`/admin/banners/${item.id}`); }}
                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    }
                ]}
                onRowClick={(item) => router.push(`/admin/banners/${item.id}`)}
            />
        </div>
    );
}
