'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('user_authenticated');
      const isAdmin = localStorage.getItem('admin_authenticated');
      const isAuthPage = pathname === '/auth';
      const isAdminPage = pathname.startsWith('/admin');
      const isApiRoute = pathname.startsWith('/api');

      // Skip auth check for API routes
      if (isApiRoute) {
        setIsCheckingAuth(false);
        return;
      }

      // If on auth page and already authenticated, redirect appropriately
      if (isAuthPage) {
        if (isAuthenticated) {
          router.push('/');
          return;
        }
        if (isAdmin) {
          router.push('/admin');
          return;
        }
      }
      // If not on auth page and not authenticated, redirect to auth
      else if (!isAuthPage && !isAdminPage) {
        if (!isAuthenticated && !isAdmin) {
          router.push('/auth');
          return;
        }
      }
      // If on admin page but not admin, redirect to auth
      else if (isAdminPage && !isAdmin) {
        router.push('/auth');
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#d32f2f'
      }}>
        <div style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}