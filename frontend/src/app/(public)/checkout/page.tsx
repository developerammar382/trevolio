'use client';

import { useState, useEffect } from 'react';
import { FiCheckCircle, FiCreditCard, FiTruck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import StripeProvider from '@/components/providers/StripeProvider';
import PaymentForm from '@/components/checkout/PaymentForm';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import CODConfirmation from '@/components/checkout/CODConfirmation';
import Link from 'next/link';
import { useCurrency } from '@/hooks/useCurrency';

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { items, cartTotal, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const { formatPrice } = useCurrency();
    const router = useRouter();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        email: '',
    });
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
    const [codSettings, setCodSettings] = useState({
        enabled: false,
        fee: 0,
        currencies: 'PKR,USD'
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/checkout');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    useEffect(() => {
        // Fetch COD settings
        const fetchCODSettings = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/public`);
                if (response.ok) {
                    const data = await response.json();
                    setCodSettings({
                        enabled: data.cod_enabled || false,
                        fee: data.cod_fee || 0,
                        currencies: data.cod_currencies || 'PKR,USD'
                    });
                }
            } catch (error) {
                console.error('Failed to fetch COD settings:', error);
            }
        };
        fetchCODSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleShippingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderData = {
                items: items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    selectedVariants: item.product.selectedVariants || {}
                })),
                shipping_address: {
                    full_name: formData.fullName,
                    address: formData.address,
                    city: formData.city,
                    postal_code: formData.postalCode,
                    email: formData.email
                },
                billing_address: {
                    full_name: formData.fullName,
                    address: formData.address,
                    city: formData.city,
                    postal_code: formData.postalCode,
                    email: formData.email
                },
                payment_method: paymentMethod,
            };

            const token = localStorage.getItem('token');
            const headers: any = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to initiate order');
            }

            const data = await response.json();

            if (paymentMethod === 'stripe') {
                setClientSecret(data.clientSecret);
                setOrderId(data.order.id);
                setStep(2);
            } else {
                // COD order - go to step 2 for confirmation
                setOrderId(data.order.id);
                setStep(2);
            }

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (items.length === 0 && step === 1) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Link href="/products" className="text-primary hover:underline">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-12">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0" />
                    <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />

                    {[
                        { num: 1, label: 'Shipping', icon: FiTruck },
                        { num: 2, label: 'Payment', icon: FiCreditCard },
                        { num: 3, label: 'Confirmation', icon: FiCheckCircle },
                    ].map((s) => (
                        <div key={s.num} className="relative z-10 flex flex-col items-center bg-background px-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s.num ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-muted text-muted-foreground'
                                }`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-sm font-medium mt-2 ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                                <form onSubmit={handleShippingSubmit} className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium">Contact Email</label>
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="email@example.com"
                                            readOnly={!!user} // Read-only if logged in
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-2">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Postal Code</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>

                                    <div className="col-span-2 mt-6">
                                        <PaymentMethodSelector
                                            selectedMethod={paymentMethod}
                                            onMethodChange={setPaymentMethod}
                                            codEnabled={codSettings.enabled}
                                            codFee={codSettings.fee}
                                            codCurrencies={codSettings.currencies}
                                        />
                                    </div>

                                    <div className="col-span-2 mt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                                        >
                                            {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Continue to Payment'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                {paymentMethod === 'stripe' && clientSecret ? (
                                    <>
                                        <h2 className="text-xl font-bold mb-6">Payment Details</h2>
                                        <StripeProvider clientSecret={clientSecret}>
                                            <PaymentForm orderId={orderId!} />
                                        </StripeProvider>
                                        <button
                                            onClick={() => setStep(1)}
                                            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Back to Shipping
                                        </button>
                                    </>
                                ) : paymentMethod === 'cod' ? (
                                    <>
                                        <h2 className="text-xl font-bold mb-6">Confirm Your Order</h2>
                                        <CODConfirmation
                                            total={cartTotal + codSettings.fee}
                                            codFee={codSettings.fee}
                                            onPlaceOrder={async () => {
                                                // Clear cart and redirect to success
                                                clearCart();
                                                // Wait a bit for state to update
                                                await new Promise(resolve => setTimeout(resolve, 100));
                                                router.push(`/checkout/success?order_id=${orderId}`);
                                            }}
                                            loading={false}
                                        />
                                        <button
                                            onClick={() => setStep(1)}
                                            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Back to Shipping
                                        </button>
                                    </>
                                ) : null}
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-card p-6 rounded-2xl border border-border sticky top-24">
                        <h3 className="font-bold mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm mb-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{formatPrice(10)}</span>
                            </div>
                        </div>
                        <div className="border-t border-border pt-4 flex justify-between font-bold">
                            <span>Total</span>
                            <span>{formatPrice(cartTotal + 10)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
