'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import StatsCard from '@/components/admin/StatsCard';
import SalesChart from '@/components/admin/dashboard/SalesChart';
import TopProducts from '@/components/admin/dashboard/TopProducts';
import TopCustomers from '@/components/admin/dashboard/TopCustomers';
import { FiDollarSign, FiShoppingBag, FiBox, FiUsers } from 'react-icons/fi';
import { useCurrency } from '@/hooks/useCurrency';

interface DashboardStats {
    total_revenue: number;
    total_orders: number;
    total_products: number;
    total_users: number;
    sales_chart: { date: string; revenue: number }[];
    top_products: any[];
    top_customers: any[];
}

export default function AdminDashboard() {
    const { formatPrice } = useCurrency();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Revenue"
                    value={formatPrice(stats?.total_revenue || 0)}
                    icon={<FiDollarSign className="w-6 h-6" />}
                    trend={{ value: 12.5, label: "vs last month" }}
                />
                <StatsCard
                    title="Total Orders"
                    value={stats?.total_orders || 0}
                    icon={<FiShoppingBag className="w-6 h-6" />}
                    trend={{ value: 8.2, label: "vs last month" }}
                />
                <StatsCard
                    title="Total Products"
                    value={stats?.total_products || 0}
                    icon={<FiBox className="w-6 h-6" />}
                />
                <StatsCard
                    title="Total Users"
                    value={stats?.total_users || 0}
                    icon={<FiUsers className="w-6 h-6" />}
                    trend={{ value: -2.4, label: "vs last month" }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <SalesChart data={stats?.sales_chart || []} />
                </div>
                <div>
                    <TopProducts products={stats?.top_products || []} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopCustomers customers={stats?.top_customers || []} />
                {/* Placeholder for Recent Orders or other widgets */}
            </div>
        </div>
    );
}
