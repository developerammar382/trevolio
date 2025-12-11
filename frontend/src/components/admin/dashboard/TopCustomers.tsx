'use client';

import Link from 'next/link';
import { FiExternalLink, FiUser } from 'react-icons/fi';
import { useCurrency } from '@/hooks/useCurrency';

interface TopCustomer {
    id: number;
    name: string;
    email: string;
    total_spent: number;
    orders_count: number;
}

interface TopCustomersProps {
    customers: TopCustomer[];
}

export default function TopCustomers({ customers }: TopCustomersProps) {
    const { formatPrice } = useCurrency();

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Top Customers</h3>
                <Link href="/admin/users" className="text-sm text-primary hover:text-accent transition-colors flex items-center gap-1">
                    View All <FiExternalLink />
                </Link>
            </div>

            <div className="space-y-4">
                {customers.map((customer, index) => (
                    <div key={customer.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                            <FiUser className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-900 truncate">
                                {customer.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                                {customer.email}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">
                                {formatPrice(customer.total_spent)}
                            </p>
                            <p className="text-xs text-slate-500">
                                {customer.orders_count} orders
                            </p>
                        </div>
                    </div>
                ))}

                {customers.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        No customer data available yet.
                    </div>
                )}
            </div>
        </div>
    );
}
