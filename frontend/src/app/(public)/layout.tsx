import Header from "@/components/layout/Header";
import Footer from '@/components/layout/Footer';
import { SettingsProvider } from '@/context/SettingsContext';
import PromoStrip from '@/components/promotions/PromoStrip';
import PromotionModal from '@/components/promotions/PromotionModal';
import ChatWidget from '@/components/chat/ChatWidget';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SettingsProvider>
            <div className="min-h-screen flex flex-col">
                <PromoStrip />
                <PromotionModal />
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
                <ChatWidget />
            </div>
        </SettingsProvider>
    );
}
