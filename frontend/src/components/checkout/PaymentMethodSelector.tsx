'use client';

import { FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { useCurrency } from '@/hooks/useCurrency';

interface PaymentMethodSelectorProps {
    selectedMethod: 'stripe' | 'cod';
    onMethodChange: (method: 'stripe' | 'cod') => void;
    codEnabled: boolean;
    codFee: number;
    codCurrencies: string;
}

export default function PaymentMethodSelector({
    selectedMethod,
    onMethodChange,
    codEnabled,
    codFee,
    codCurrencies
}: PaymentMethodSelectorProps) {
    const { currency, formatPrice } = useCurrency();

    // Check if COD is available for current currency
    const isCODAvailable = codEnabled && codCurrencies.split(',').includes(currency);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Select Payment Method</h3>

            {/* Stripe Payment */}
            <label
                className={`block p-6 border-2 rounded-xl cursor-pointer transition-all ${selectedMethod === 'stripe'
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
            >
                <div className="flex items-center gap-4">
                    <input
                        type="radio"
                        name="payment_method"
                        value="stripe"
                        checked={selectedMethod === 'stripe'}
                        onChange={() => onMethodChange('stripe')}
                        className="w-5 h-5 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <FiCreditCard className="w-6 h-6 text-primary" />
                            <div>
                                <div className="font-semibold text-slate-900">Credit / Debit Card</div>
                                <div className="text-sm text-slate-500">Pay securely with Stripe</div>
                            </div>
                        </div>
                    </div>
                </div>
            </label>

            {/* Cash on Delivery */}
            {isCODAvailable && (
                <label
                    className={`block p-6 border-2 rounded-xl cursor-pointer transition-all ${selectedMethod === 'cod'
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <input
                            type="radio"
                            name="payment_method"
                            value="cod"
                            checked={selectedMethod === 'cod'}
                            onChange={() => onMethodChange('cod')}
                            className="w-5 h-5 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FiDollarSign className="w-6 h-6 text-green-600" />
                                    <div>
                                        <div className="font-semibold text-slate-900">Cash on Delivery</div>
                                        <div className="text-sm text-slate-500">Pay when you receive</div>
                                    </div>
                                </div>
                                {codFee > 0 && (
                                    <div className="text-sm text-slate-600">
                                        + {formatPrice(codFee)} fee
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </label>
            )}

            {!isCODAvailable && codEnabled && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                    Cash on Delivery is not available for {currency}. Please select card payment.
                </div>
            )}
        </div>
    );
}
