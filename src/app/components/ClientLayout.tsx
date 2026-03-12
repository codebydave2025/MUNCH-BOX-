'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith('/admin') || pathname === '/auth';

    return (
        <>
            {!isAuthPage && <Header />}
            {children}
            {!isAuthPage && <Footer />}
        </>
    );
}
