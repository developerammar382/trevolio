'use client';

import Link from 'next/link';
import { FiGithub, FiTwitter, FiInstagram, FiFacebook } from 'react-icons/fi';
import { useSettings } from '@/context/SettingsContext';

export default function Footer() {
    const { settings } = useSettings();

    const socialLinks = [
        { icon: FiFacebook, url: settings.facebook || '#', show: !!settings.facebook },
        { icon: FiTwitter, url: settings.twitter || '#', show: !!settings.twitter },
        { icon: FiInstagram, url: settings.instagram || '#', show: !!settings.instagram },
    ].filter(link => link.show);

    // Show GitHub if no social links are configured
    if (socialLinks.length === 0) {
        socialLinks.push({ icon: FiGithub, url: '#', show: true });
    }

    return (
        <footer className="bg-primary text-white pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div>
                        <Link href="/" className="text-2xl font-bold font-heading text-white flex items-center gap-2 mb-6">
                            {settings.footer_logo_url ? (
                                <img
                                    src={settings.footer_logo_url}
                                    alt={settings.site_name || 'Logo'}
                                    className="h-16 w-auto object-contain"
                                />
                            ) : (
                                <>
                                    <span className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
                                        {settings.site_name?.[0] || 'E'}
                                    </span>
                                    {settings.site_name || 'E-Store'}
                                </>
                            )}
                        </Link>
                        <p className="text-white/70 leading-relaxed mb-8">
                            {settings.site_description || 'Your premium destination for quality products. We believe in style, quality, and exceptional customer service.'}
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-white transition-all duration-300"
                                >
                                    <link.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold font-heading text-lg text-white mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            {['Home', 'Shop', 'About Us', 'Contact', 'Blog'].map((item) => (
                                <li key={item}>
                                    <Link href="/" className="text-white/70 hover:text-accent transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold font-heading text-lg text-white mb-6">Customer Service</h3>
                        <ul className="space-y-4">
                            {['FAQ', 'Shipping Policy', 'Returns & Refunds', 'Privacy Policy', 'Terms of Service'].map((item) => (
                                <li key={item}>
                                    <Link href="/" className="text-white/70 hover:text-accent transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold font-heading text-lg text-white mb-6">Contact Us</h3>
                        <div className="space-y-4 text-white/70">
                            {settings.site_email && (
                                <p>
                                    <span className="font-semibold text-white">Email:</span><br />
                                    <a href={`mailto:${settings.site_email}`} className="hover:text-accent transition-colors">
                                        {settings.site_email}
                                    </a>
                                </p>
                            )}
                            {settings.site_phone && (
                                <p>
                                    <span className="font-semibold text-white">Phone:</span><br />
                                    <a href={`tel:${settings.site_phone}`} className="hover:text-accent transition-colors">
                                        {settings.site_phone}
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-white/50 text-sm">
                    <p>&copy; {new Date().getFullYear()} {settings.site_name || 'E-Store'}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
