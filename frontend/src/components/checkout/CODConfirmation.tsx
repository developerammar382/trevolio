'use client';

import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import { useCurrency } from '@/hooks/useCurrency';

interface CODConfirmationProps {
    total: number;
    codFee: number;
    onPlaceOrder: () => void;
    loading: boolean;
}

export default function CODConfirmation({ total, codFee, onPlaceOrder, loading }: CODConfirmationProps) {
    const { formatPrice } = useCurrency();

    return (
        <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                        <FiCheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                            Cash on Delivery Selected
                        </h3>
                        <p className="text-sm text-green-700">
                            You will pay {formatPrice(total)} when your order is delivered to your doorstep.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FiPackage className="w-5 h-5" />
                    Order Summary
                </h4>
                <div className="space-y-3">
                    <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>{formatPrice(total - codFee)}</span>
                    </div>
                    {codFee > 0 && (
                        <div className="flex justify-between text-slate-600">
                            <span>COD Fee</span>
                            <span>{formatPrice(codFee)}</span>
                        </div>
                    )}
                    <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-lg">
                        <span>Total to Pay on Delivery</span>
                        <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h5 className="font-medium text-blue-900 mb-2">Important Information</h5>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Please keep the exact amount ready for payment</li>
                    <li>Our delivery partner will collect the payment</li>
                    <li>You can inspect the product before payment</li>
                </ul>
            </div>

            <button
                onClick={onPlaceOrder}
                disabled={loading}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Placing Order...' : 'Place Order'}
            </button>
        </div>
    );
}
