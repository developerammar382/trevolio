'use client';

import { format } from 'date-fns';
import { FiCheckCircle, FiClock, FiTruck, FiXCircle, FiPackage } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface StatusHistory {
    id: number;
    status: string;
    comment: string | null;
    created_at: string;
}

interface OrderStatusTimelineProps {
    history: StatusHistory[];
    currentStatus: string;
}

export default function OrderStatusTimeline({ history, currentStatus }: OrderStatusTimelineProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return FiCheckCircle;
            case 'cancelled': return FiXCircle;
            case 'shipped': return FiTruck;
            case 'processing': return FiPackage;
            default: return FiClock;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-600';
            case 'cancelled': return 'bg-red-100 text-red-600';
            case 'shipped': return 'bg-purple-100 text-purple-600';
            case 'processing': return 'bg-blue-100 text-blue-600';
            default: return 'bg-yellow-100 text-yellow-600';
        }
    };

    if (!history || history.length === 0) {
        return <div className="text-sm text-slate-500">No status history available.</div>;
    }

    return (
        <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
            {history.map((item, index) => {
                const Icon = getStatusIcon(item.status);
                const isLatest = index === 0;

                return (
                    <div key={item.id} className="relative">
                        <span className={cn(
                            "absolute -left-[25px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white",
                            getStatusColor(item.status)
                        )}>
                            <Icon className="w-4 h-4" />
                        </span>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                            <div>
                                <h4 className="font-medium text-slate-900 capitalize">
                                    {item.status.replace('_', ' ')}
                                </h4>
                                {item.comment && (
                                    <p className="text-sm text-slate-500 mt-1">{item.comment}</p>
                                )}
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                                {format(new Date(item.created_at), 'MMM d, h:mm a')}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
