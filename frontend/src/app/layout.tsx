import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { Toaster } from "react-hot-toast";
import { SettingsProvider } from "@/context/SettingsContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins"
});

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  const siteTitle = settings?.site_title || "Trevolio";
  const siteDescription = settings?.site_description || "Curated quality and sophistication for your global lifestyle.";
  const siteKeywords = settings?.site_keywords ? settings.site_keywords.split(',').map((k: string) => k.trim()) : [];
  const separator = settings?.title_separator || "|";

  return {
    title: {
      default: siteTitle,
      template: `%s ${separator} ${siteTitle}`,
    },
    description: siteDescription,
    keywords: siteKeywords,
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      type: 'website',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          <SettingsProvider>
            <CurrencyProvider>
              <CartProvider>
                {children}
                <Toaster position="top-right" />
              </CartProvider>
            </CurrencyProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
