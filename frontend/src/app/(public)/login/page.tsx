"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Logged in successfully');
            router.push(redirect);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Brand/Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                                E
                            </span>
                            <span className="text-3xl font-bold">Store</span>
                        </div>
                        <h1 className="text-5xl font-bold mb-6 leading-tight">
                            Welcome Back to<br />Your Shopping Hub
                        </h1>
                        <p className="text-white/80 leading-relaxed">
                            Sign in to access your personalized shopping experience, track orders, and discover exclusive deals.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mt-8">
                        {[
                            { icon: '🛍️', text: 'Access your wishlist and saved items' },
                            { icon: '📦', text: 'Track your orders in real-time' },
                            { icon: '🎁', text: 'Get exclusive member-only deals' },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="text-3xl">{feature.icon}</span>
                                <span className="text-white/90">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold text-slate-900 mb-3">Sign In</h2>
                            <p className="text-slate-600">Enter your credentials to continue</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="h-12 px-4 rounded-xl border-slate-300 focus:border-primary focus:ring-primary"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                                        Password
                                    </label>
                                    <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 hover:underline">
                                        Forgot?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-12 px-4 rounded-xl border-slate-300 focus:border-primary focus:ring-primary"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all text-white"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-slate-500">New to Trevolio?</span>
                                </div>
                            </div>

                            <Link
                                href={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
                                className="block w-full h-12 px-6 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-center leading-[44px]"
                            >
                                Create an Account
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
