'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiSettings, FiImage, FiGlobe, FiMail, FiShoppingBag, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiUpload, FiSearch } from 'react-icons/fi';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Settings {
    general?: {
        site_name?: string;
        site_description?: string;
        site_email?: string;
        site_phone?: string;
        site_logo?: string;
        site_logo_url?: string;
        show_logo?: string; // '1' or '0'
    };
    store?: {
        currency?: string;
        tax_rate?: string;
        shipping_fee?: string;
    };
    social?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
    };
}

interface Banner {
    id: number;
    title: string;
    subtitle: string;
    image_url: string;
    button_text: string;
    button_link: string;
    bg_color: string;
    show_gradient: boolean;
    gradient_type: 'preset' | 'custom';
    gradient_start_color?: string;
    gradient_end_color?: string;
    gradient_direction?: string;
    order_index: number;
    is_active: boolean;
    position?: string | string[];
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'settings' | 'banners' | 'seo'>('settings');
    const [settings, setSettings] = useState<Settings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        site_name: '',
        site_description: '',
        site_email: '',
        site_phone: '',
        currency: 'PKR',
        usd_to_pkr_rate: '280',
        tax_rate: '0',
        shipping_fee: '0',
        facebook: '',
        twitter: '',
        instagram: '',
        show_logo: false,
        site_title: '',
        site_keywords: '',
        title_separator: '|',
        cod_enabled: '1',
        cod_fee: '0',
        cod_currencies: 'PKR,USD',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null);
    const [footerLogoPreview, setFooterLogoPreview] = useState<string | null>(null);

    const [banners, setBanners] = useState<Banner[]>([]);
    const [showBannerForm, setShowBannerForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [bannerFormData, setBannerFormData] = useState({
        title: '',
        subtitle: '',
        image_url: '',
        button_text: '',
        button_link: '',
        bg_color: 'from-blue-600 to-purple-600',
        show_gradient: true,
        gradient_type: 'preset' as 'preset' | 'custom',
        gradient_start_color: '#2563eb',
        gradient_end_color: '#9333ea',
        gradient_direction: 'to right',
        is_active: true,
    });

    useEffect(() => {
        fetchSettings();
        fetchBanners();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            setSettings(res.data);

            const flatSettings: any = {};
            Object.keys(res.data).forEach((group) => {
                Object.assign(flatSettings, res.data[group]);
            });

            setFormData({
                ...formData,
                ...flatSettings,
                show_logo: flatSettings.show_logo === '1'
            });

            if (flatSettings.site_logo_url) {
                setLogoPreview(flatSettings.site_logo_url);
            }
            if (flatSettings.footer_logo_url) {
                setFooterLogoPreview(flatSettings.footer_logo_url);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const fetchBanners = async () => {
        try {
            const res = await api.get('/admin/banners');
            // Filter for hero banners only (or those without a specific position, for backward compatibility)
            const heroBanners = res.data.filter((b: Banner) => {
                const positions = Array.isArray(b.position) ? b.position : [b.position || 'hero'];
                return positions.includes('hero');
            });
            setBanners(heroBanners);
        } catch (error) {
            console.error('Error fetching banners:', error);
        }
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Upload logo if selected
            if (logoFile) {
                const logoData = new FormData();
                logoData.append('logo', logoFile);
                await api.post('/admin/settings/logo', logoData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Upload footer logo if selected
            if (footerLogoFile) {
                const footerLogoData = new FormData();
                footerLogoData.append('footer_logo', footerLogoFile);
                await api.post('/admin/settings/footer-logo', footerLogoData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            const settingsArray = [
                { key: 'site_name', value: formData.site_name, group: 'general' },
                { key: 'site_description', value: formData.site_description, group: 'general' },
                { key: 'site_email', value: formData.site_email, group: 'general' },
                { key: 'site_phone', value: formData.site_phone, group: 'general' },
                { key: 'show_logo', value: formData.show_logo ? '1' : '0', group: 'general' },
                { key: 'currency', value: formData.currency, group: 'currency' },
                { key: 'usd_to_pkr_rate', value: formData.usd_to_pkr_rate, group: 'currency' },
                { key: 'cod_enabled', value: formData.cod_enabled, group: 'payment' },
                { key: 'cod_fee', value: formData.cod_fee, group: 'payment' },
                { key: 'cod_currencies', value: formData.cod_currencies, group: 'payment' },
                { key: 'tax_rate', value: formData.tax_rate, group: 'store' },
                { key: 'shipping_fee', value: formData.shipping_fee, group: 'store' },
                { key: 'facebook', value: formData.facebook, group: 'social' },
                { key: 'twitter', value: formData.twitter, group: 'social' },
                { key: 'instagram', value: formData.instagram, group: 'social' },
                { key: 'site_title', value: formData.site_title, group: 'seo' },
                { key: 'site_keywords', value: formData.site_keywords, group: 'seo' },
                { key: 'title_separator', value: formData.title_separator, group: 'seo' },
            ];

            await api.post('/admin/settings', { settings: settingsArray });
            toast.success('Settings saved successfully');
            fetchSettings();
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast.error(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleBannerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingBanner) {
                await api.put(`/admin/banners/${editingBanner.id}`, {
                    ...bannerFormData,
                    position: 'hero', // Ensure it stays as hero
                });
                toast.success('Banner updated successfully');
            } else {
                await api.post('/admin/banners', {
                    ...bannerFormData,
                    position: 'hero', // Explicitly set as hero banner
                    order_index: banners.length,
                });
                toast.success('Banner created successfully');
            }

            fetchBanners();
            resetBannerForm();
        } catch (error: any) {
            console.error('Error saving banner:', error);
            toast.error(error.response?.data?.message || 'Failed to save banner');
        }
    };

    const handleEditBanner = (banner: Banner) => {
        setEditingBanner(banner);
        setBannerFormData({
            title: banner.title,
            subtitle: banner.subtitle,
            image_url: banner.image_url,
            button_text: banner.button_text,
            button_link: banner.button_link,
            bg_color: banner.bg_color || 'from-blue-600 to-purple-600',
            show_gradient: banner.show_gradient !== undefined ? banner.show_gradient : true,
            gradient_type: banner.gradient_type || 'preset',
            gradient_start_color: banner.gradient_start_color || '#2563eb',
            gradient_end_color: banner.gradient_end_color || '#9333ea',
            gradient_direction: banner.gradient_direction || 'to right',
            is_active: banner.is_active,
        });
        setShowBannerForm(true);
    };

    const handleDeleteBanner = async (id: number) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            await api.delete(`/admin/banners/${id}`);
            toast.success('Banner deleted successfully');
            fetchBanners();
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast.error('Failed to delete banner');
        }
    };

    const toggleBannerActive = async (banner: Banner) => {
        try {
            await api.put(`/admin/banners/${banner.id}`, {
                ...banner,
                is_active: !banner.is_active,
            });
            toast.success(`Banner ${!banner.is_active ? 'activated' : 'deactivated'}`);
            fetchBanners();
        } catch (error) {
            console.error('Error toggling banner:', error);
            toast.error('Failed to update banner');
        }
    };

    const resetBannerForm = () => {
        setBannerFormData({
            title: '',
            subtitle: '',
            image_url: '',
            button_text: '',
            button_link: '',
            bg_color: 'from-blue-600 to-purple-600',
            show_gradient: true,
            gradient_type: 'preset',
            gradient_start_color: '#2563eb',
            gradient_end_color: '#9333ea',
            gradient_direction: 'to right',
            is_active: true,
        });
        setEditingBanner(null);
        setShowBannerForm(false);
    };

    const gradientOptions = [
        { value: 'from-blue-600 to-purple-600', label: 'Blue to Purple' },
        { value: 'from-orange-500 to-red-600', label: 'Orange to Red' },
        { value: 'from-green-500 to-teal-600', label: 'Green to Teal' },
        { value: 'from-pink-500 to-rose-600', label: 'Pink to Rose' },
        { value: 'from-indigo-600 to-blue-600', label: 'Indigo to Blue' },
        { value: 'from-yellow-500 to-orange-600', label: 'Yellow to Orange' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-slate-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
                <p className="text-slate-600">Manage your store settings and homepage banners</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'settings'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FiSettings className="w-5 h-5" />
                        Site Settings
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('banners')}
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'banners'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FiImage className="w-5 h-5" />
                        Homepage Banners
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('seo')}
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'seo'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FiSearch className="w-5 h-5" />
                        SEO Settings
                    </div>
                </button>
            </div>

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* General Settings */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <FiGlobe className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">General Settings</h2>
                                <p className="text-sm text-slate-600">Basic information about your store</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Site Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.site_name}
                                    onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="My Store"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.site_email}
                                    onChange={(e) => setFormData({ ...formData, site_email: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="contact@store.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.site_phone}
                                    onChange={(e) => setFormData({ ...formData, site_phone: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Site Description
                                </label>
                                <textarea
                                    value={formData.site_description}
                                    onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Your one-stop shop for..."
                                />
                            </div>

                            {/* Logo Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Site Logo
                                </label>
                                <div className="flex items-center gap-4">
                                    {logoPreview && (
                                        <div className="w-24 h-24 border-2 border-slate-200 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                                            <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoSelect}
                                            className="hidden"
                                            id="logo-upload"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                                        >
                                            <FiUpload className="w-4 h-4" />
                                            Choose Logo
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="show_logo"
                                            checked={formData.show_logo}
                                            onChange={(e) => setFormData({ ...formData, show_logo: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="show_logo" className="text-sm text-slate-700">
                                            Show logo on website
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Logo Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Footer Logo
                                </label>
                                <div className="flex items-center gap-4">
                                    {footerLogoPreview && (
                                        <div className="w-24 h-24 border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center p-2">
                                            <img src={footerLogoPreview} alt="Footer Logo" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setFooterLogoFile(file);
                                                    setFooterLogoPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="hidden"
                                            id="footer-logo-upload"
                                        />
                                        <label
                                            htmlFor="footer-logo-upload"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                                        >
                                            <FiUpload className="w-4 h-4" />
                                            Choose Footer Logo
                                        </label>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Upload a logo for the footer (recommended: white/light version for dark background)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Store Settings */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <FiShoppingBag className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Store Settings</h2>
                                <p className="text-sm text-slate-600">Configure pricing and shipping</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Currency
                                </label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="PKR">PKR (Rs)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Select the default currency for your store</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    USD to PKR Exchange Rate
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.usd_to_pkr_rate || '280'}
                                    onChange={(e) => setFormData({ ...formData, usd_to_pkr_rate: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="280"
                                />
                                <p className="text-xs text-slate-500 mt-1">Used to convert prices when USD is selected</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Tax Rate (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.tax_rate}
                                    onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Shipping Fee
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.shipping_fee}
                                    onChange={(e) => setFormData({ ...formData, shipping_fee: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <FiShoppingBag className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Payment Settings</h2>
                                <p className="text-sm text-slate-600">Configure payment methods and fees</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Enable Cash on Delivery (COD)
                                    </label>
                                    <p className="text-xs text-slate-500 mt-1">Allow customers to pay on delivery</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.cod_enabled === '1'}
                                        onChange={(e) => setFormData({ ...formData, cod_enabled: e.target.checked ? '1' : '0' })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        COD Fee
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cod_fee}
                                        onChange={(e) => setFormData({ ...formData, cod_fee: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Additional fee for COD orders (in PKR)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        COD Available Currencies
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.cod_currencies}
                                        onChange={(e) => setFormData({ ...formData, cod_currencies: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="PKR,USD"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Comma-separated list (e.g., PKR,USD)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <FiMail className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Social Media</h2>
                                <p className="text-sm text-slate-600">Connect your social profiles</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Facebook URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.facebook}
                                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Twitter URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.twitter}
                                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://twitter.com/..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Instagram URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.instagram}
                                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold disabled:opacity-50"
                        >
                            <FiSave className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <FiSearch className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">SEO Configuration</h2>
                                <p className="text-sm text-slate-600">Global search engine optimization settings</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Default Site Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.site_title}
                                    onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="My E-Commerce Store"
                                />
                                <p className="text-xs text-slate-500 mt-1">Used when no specific page title is available.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Title Separator
                                </label>
                                <select
                                    value={formData.title_separator}
                                    onChange={(e) => setFormData({ ...formData, title_separator: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="|">| (Pipe)</option>
                                    <option value="-">- (Dash)</option>
                                    <option value="—">— (Em Dash)</option>
                                    <option value="•">• (Bullet)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Default Meta Keywords
                                </label>
                                <input
                                    type="text"
                                    value={formData.site_keywords}
                                    onChange={(e) => setFormData({ ...formData, site_keywords: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="ecommerce, shop, online store"
                                />
                                <p className="text-xs text-slate-500 mt-1">Comma separated list of keywords.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold disabled:opacity-50"
                        >
                            <FiSave className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Save SEO Settings'}
                        </button>
                    </div>
                </form>
            )}

            {/* Banners Tab */}
            {activeTab === 'banners' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-slate-600">Manage carousel banners on the homepage</p>
                        <button
                            onClick={() => setShowBannerForm(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                            <FiPlus className="w-5 h-5" />
                            Add New Banner
                        </button>
                    </div>

                    {/* Banner Form Modal */}
                    {showBannerForm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-slate-200">
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                                    </h2>
                                </div>

                                <form onSubmit={handleBannerSubmit} className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={bannerFormData.title}
                                            onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Premium Headphones"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Subtitle</label>
                                        <textarea
                                            value={bannerFormData.subtitle}
                                            onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Experience crystal clear sound quality"
                                            rows={2}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Image URL *</label>
                                        <input
                                            type="url"
                                            required
                                            value={bannerFormData.image_url}
                                            onChange={(e) => setBannerFormData({ ...bannerFormData, image_url: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                        {bannerFormData.image_url && (
                                            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                                                <img
                                                    src={bannerFormData.image_url}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/placeholder.png';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Button Text</label>
                                            <input
                                                type="text"
                                                value={bannerFormData.button_text}
                                                onChange={(e) => setBannerFormData({ ...bannerFormData, button_text: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Shop Now"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Button Link</label>
                                            <input
                                                type="text"
                                                value={bannerFormData.button_link}
                                                onChange={(e) => setBannerFormData({ ...bannerFormData, button_link: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="/products"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-t border-slate-100 pt-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold text-slate-700">Gradient Overlay</label>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm ${!bannerFormData.show_gradient ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>Off</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setBannerFormData({ ...bannerFormData, show_gradient: !bannerFormData.show_gradient })}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${bannerFormData.show_gradient ? 'bg-blue-600' : 'bg-slate-200'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${bannerFormData.show_gradient ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                                <span className={`text-sm ${bannerFormData.show_gradient ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>On</span>
                                            </div>
                                        </div>

                                        {bannerFormData.show_gradient && (
                                            <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Gradient Type</label>
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="gradient_type"
                                                                value="preset"
                                                                checked={bannerFormData.gradient_type === 'preset'}
                                                                onChange={() => setBannerFormData({ ...bannerFormData, gradient_type: 'preset' })}
                                                                className="text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-slate-700">Preset Theme</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="gradient_type"
                                                                value="custom"
                                                                checked={bannerFormData.gradient_type === 'custom'}
                                                                onChange={() => setBannerFormData({ ...bannerFormData, gradient_type: 'custom' })}
                                                                className="text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-slate-700">Custom Colors</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {bannerFormData.gradient_type === 'preset' ? (
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Preset</label>
                                                        <select
                                                            value={bannerFormData.bg_color}
                                                            onChange={(e) => setBannerFormData({ ...bannerFormData, bg_color: e.target.value })}
                                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        >
                                                            {gradientOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className={`mt-3 h-12 rounded-xl bg-gradient-to-r ${bannerFormData.bg_color}`} />
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-2">Start Color</label>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="color"
                                                                    value={bannerFormData.gradient_start_color}
                                                                    onChange={(e) => setBannerFormData({ ...bannerFormData, gradient_start_color: e.target.value })}
                                                                    className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={bannerFormData.gradient_start_color}
                                                                    onChange={(e) => setBannerFormData({ ...bannerFormData, gradient_start_color: e.target.value })}
                                                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-2">End Color</label>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="color"
                                                                    value={bannerFormData.gradient_end_color}
                                                                    onChange={(e) => setBannerFormData({ ...bannerFormData, gradient_end_color: e.target.value })}
                                                                    className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={bannerFormData.gradient_end_color}
                                                                    onChange={(e) => setBannerFormData({ ...bannerFormData, gradient_end_color: e.target.value })}
                                                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <div
                                                                className="h-12 rounded-xl mt-2"
                                                                style={{
                                                                    background: `linear-gradient(to right, ${bannerFormData.gradient_start_color}, ${bannerFormData.gradient_end_color})`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={bannerFormData.is_active}
                                            onChange={(e) => setBannerFormData({ ...bannerFormData, is_active: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-semibold text-slate-700">
                                            Active (Show on homepage)
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                                        >
                                            {editingBanner ? 'Update Banner' : 'Create Banner'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetBannerForm}
                                            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Banners List */}
                    <div className="grid gap-6">
                        {banners.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                                <FiImage className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Banners Yet</h3>
                                <p className="text-slate-600 mb-6">Create your first banner to get started</p>
                                <button
                                    onClick={() => setShowBannerForm(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                                >
                                    <FiPlus className="w-5 h-5" />
                                    Add Banner
                                </button>
                            </div>
                        ) : (
                            banners.map((banner) => (
                                <div
                                    key={banner.id}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-1/3 relative">
                                            <img
                                                src={banner.image_url}
                                                alt={banner.title}
                                                className="w-full h-48 md:h-full object-cover"
                                            />
                                            <div className={`absolute inset-0 bg-gradient-to-r ${banner.bg_color} opacity-40`} />
                                            {!banner.is_active && (
                                                <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                                    Inactive
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{banner.title}</h3>
                                                    <p className="text-slate-600">{banner.subtitle}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => toggleBannerActive(banner)}
                                                        className={`p-2 rounded-lg transition-all ${banner.is_active
                                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            }`}
                                                        title={banner.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {banner.is_active ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditBanner(banner)}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBanner(banner.id)}
                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-500">Button:</span>
                                                    <span className="ml-2 font-semibold text-slate-900">{banner.button_text || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Link:</span>
                                                    <span className="ml-2 font-semibold text-slate-900">{banner.button_link || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Order:</span>
                                                    <span className="ml-2 font-semibold text-slate-900">#{banner.order_index}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
