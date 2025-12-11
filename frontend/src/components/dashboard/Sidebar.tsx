'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiShoppingBag, FiMapPin, FiHeart, FiUser, FiLogOut, FiHome } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
    { name: 'Overview', href: '/dashboard', icon: FiGrid },
    { name: 'My Orders', href: '/dashboard/orders', icon: FiShoppingBag },
    { name: 'Address Book', href: '/dashboard/addresses', icon: FiMapPin },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: FiHeart },
    { name: 'Profile Settings', href: '/dashboard/profile', icon: FiUser },
];

export default function DashboardSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="w-full lg:w-64 bg-white rounded-2xl border border-slate-200 p-6 h-fit">
            <div className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-slate-400")} />
                            {item.name}
                        </Link>
                    );
                })}

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
                    >
                        <FiHome className="w-5 h-5 text-slate-400" />
                        Back to Store
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                        <FiLogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
