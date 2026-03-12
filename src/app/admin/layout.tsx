'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    LayoutDashboard,
    Package,
    Receipt,
    Users,
    UserCircle,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ShoppingCart,
    Search,
    MessageSquare
} from 'lucide-react';
import styles from './layout.module.css';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
    { icon: Package, label: 'Items', href: '/admin/items' },
    { icon: Receipt, label: 'Sales', href: '/admin/sales' },
    { icon: Users, label: 'Employees', href: '/admin/employees' },
    { icon: UserCircle, label: 'Customers', href: '/admin/customers' },
    { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
    { icon: MessageSquare, label: 'Reviews', href: '/admin/reviews' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [lastOrderCount, setLastOrderCount] = useState<number | null>(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [adminSearch, setAdminSearch] = useState('');
    const router = useRouter();
    const pathname = usePathname();

    // Responsive sidebar: start open on desktop, closed on mobile
    useEffect(() => {
        if (window.innerWidth > 1024) {
            setIsSidebarOpen(true);
        }
    }, [pathname]);

    // Close sidebar on mobile when path changes
    useEffect(() => {
        if (window.innerWidth <= 1024) {
            setIsSidebarOpen(false);
        }
    }, [pathname]);

    const fetchPendingCount = async () => {
        try {
            const res = await fetch('/api/orders?t=' + Date.now(), {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            if (res.ok) {
                const orders = await res.json();
                if (!Array.isArray(orders)) return;
                const pending = orders.filter((o: any) => o && o.status === 'pending');

                if (pending.length > 0) {
                    document.title = `(${pending.length}) New Orders | Admin MUNCHBOX`;

                    // Trigger sound if count increased
                    if (lastOrderCount !== null && pending.length > lastOrderCount) {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.play().catch(e => console.log('Audio play failed:', e));
                    }
                } else {
                    document.title = 'Admin MUNCHBOX';
                }

                setPendingCount(pending.length);
                setPendingOrders(pending);
                setLastOrderCount(pending.length);
            }
        } catch (error) {
            console.error('Failed to fetch orders for notification', error);
        }
    };

    useEffect(() => {
        const auth = localStorage.getItem('admin_authenticated');
        if (!auth && pathname !== '/admin/login') {
            router.push('/admin/login');
        } else if (auth) {
            setIsAuthenticated(true);
            fetchPendingCount();

            // Smart Polling: Poll every 5 seconds, even in background
            const interval = setInterval(() => {
                fetchPendingCount();
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [router, pathname]);

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT') {
                e.preventDefault();
                const searchInput = document.getElementById('global-admin-search');
                searchInput?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close notifications when clicking outside
    useEffect(() => {
        if (!isNotifOpen) return;
        const close = () => setIsNotifOpen(false);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [isNotifOpen]);

    const handleLogout = () => {
        localStorage.removeItem('admin_authenticated');
        router.push('/admin/login');
    };

    const handleGlobalSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminSearch.trim()) return;

        // Navigation logic based on search term
        if (adminSearch.toLowerCase().startsWith('ord-') || !isNaN(Number(adminSearch))) {
            router.push(`/admin/orders?search=${adminSearch}`);
        } else {
            router.push(`/admin/items?search=${adminSearch}`);
        }
        setAdminSearch('');
    };

    if (!isAuthenticated && pathname !== '/admin/login') {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className={styles.adminContainer}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className={styles.mobileOverlay} onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoWrapper}>
                        <h2 className={styles.logoText}>MUNCHBOX</h2>
                        <Image
                            src="/image (2)-Photoroom.png"
                            alt="MUNCHBOX Logo"
                            width={110}
                            height={110}
                            className={styles.sidebarLogo}
                            unoptimized
                        />
                    </div>
                    <button className={styles.closeBtn} onClick={() => setIsSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const isOrders = item.label === 'Orders';
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                    {isOrders && pendingCount > 0 && (
                                        <span className={styles.navBadge}>+{pendingCount}</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                {/* Topbar */}
                <header className={styles.topbar}>
                    <div className={styles.topbarLeft}>
                        <button className={styles.menuBtn} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <Menu size={24} />
                        </button>

                        <form onSubmit={handleGlobalSearch} className={styles.topbarSearch}>
                            <Search size={18} className={styles.topbarIcon} />
                            <input
                                id="global-admin-search"
                                type="search"
                                placeholder="Search orders, items... (Press /)"
                                className={styles.topbarInput}
                                value={adminSearch}
                                onChange={(e) => setAdminSearch(e.target.value)}
                            />
                        </form>
                    </div>

                    <div className={styles.topbarRight}>
                        <div className={styles.notificationWrapper} onClick={(e) => e.stopPropagation()}>
                            <button className={styles.iconBtn} onClick={() => setIsNotifOpen(!isNotifOpen)}>
                                <Bell size={20} />
                                {pendingCount > 0 && (
                                    <span className={styles.notificationBadgeCount}>{pendingCount}</span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className={styles.notificationDropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <h3>Notifications</h3>
                                        <button className={styles.clearAll} onClick={() => setIsNotifOpen(false)}>Close</button>
                                    </div>
                                    <div className={styles.dropdownContent}>
                                        {pendingOrders.length > 0 ? (
                                            pendingOrders.map((order) => (
                                                <Link
                                                    key={order.id}
                                                    href="/admin/orders"
                                                    className={styles.notificationItem}
                                                    onClick={() => setIsNotifOpen(false)}
                                                >
                                                    <div className={styles.notifIcon}>
                                                        <ShoppingCart size={18} />
                                                    </div>
                                                    <div className={styles.notifText}>
                                                        <span className={styles.notifTitle}>New Order Placed</span>
                                                        <span className={styles.notifDesc}>
                                                            Order <strong>#{order.id}</strong> by {order.customer?.name || 'Guest'}
                                                        </span>
                                                        <span className={styles.notifTime}>Total: ₦{order.total?.toLocaleString() || '0'}</span>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className={styles.emptyNotif}>
                                                <Bell size={32} opacity={0.3} />
                                                <p>No new notifications</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.userProfile}>
                            <div className={styles.avatar}>A</div>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>Admin</span>
                                <span className={styles.userRole}>Store Owner</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className={styles.topbarLogoutBtn}
                            title="Logout"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
