import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: number;
        label: string;
    };
    className?: string;
}

export default function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("bg-card p-6 rounded-xl border border-border shadow-sm", className)}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold mt-2 text-foreground">{value}</h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                    {icon}
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={cn(
                        "font-medium",
                        trend.value >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                        {trend.value >= 0 ? "+" : ""}{trend.value}%
                    </span>
                    <span className="text-muted-foreground ml-2">{trend.label}</span>
                </div>
            )}
        </motion.div>
    );
}
