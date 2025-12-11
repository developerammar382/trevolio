'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiUser, FiPackage, FiMapPin, FiLogOut } from 'react-icons/fi';
import { cn } from '@/lib/utils';

const menuItems = [
    { icon: FiUser, label: 'Overview', href: '/dashboard' },
    { icon: FiPackage, label: 'Orders', href: '/dashboard/orders' },
    { icon: FiMapPin, label: 'Addresses', href: '/dashboard/addresses' },
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <div className="bg-card rounded-2xl border border-border p-6 h-fit">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <FiUser className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-medium text-foreground">Welcome back,</p>
                    <p className="text-sm text-muted-foreground">User Name</p>
                </div>
            </div>

            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                isActive
                                    ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors mt-8">
                    <FiLogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </nav>
        </div>
    );
}
