'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, User, LogOut, Menu as MenuIcon, X, Heart } from 'lucide-react';
import styles from './Header.module.css';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
    const { cartCount, favorites } = useCart();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [filteredResults, setFilteredResults] = useState<any[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    // Fetch menu items for live search - optimized to only fetch once
    useEffect(() => {
        const loadMenu = async () => {
            try {
                const res = await fetch('/api/menu', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setMenuItems(data);
                }
            } catch (e) {
                console.error('Search failed to load menu', e);
            }
        };
        loadMenu();
    }, []);

    // Handle live filtering
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const results = menuItems.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 6); // Limit results
            setFilteredResults(results);
        } else {
            setFilteredResults([]);
        }
    }, [searchQuery, menuItems]);

    // Close search on click outside
    useEffect(() => {
        if (!showSearch) return;
        const close = () => {
            setShowSearch(false);
            setSearchQuery('');
        };
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [showSearch]);

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(!!localStorage.getItem('user_authenticated'));
            setIsAdmin(!!localStorage.getItem('admin_authenticated'));
            const userData = localStorage.getItem('current_user');
            if (userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (e) {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        checkAuth();

        const handleScroll = () => {
            if (window.scrollY > 80) {
                setScrolled(true);
            } else if (window.scrollY < 30) {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('user_authenticated');
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('current_user');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
        router.push('/auth');
    };

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/logo-white.png"
                        alt="MUNCHBOX Logo"
                        width={90}
                        height={90}
                        className={styles.logoImage}
                        priority
                        unoptimized
                    />
                </Link>

                <nav className={styles.nav}>
                    <Link href="/" className={`${styles.link} ${pathname === '/' ? styles.activeLink : ''}`}>
                        Home
                    </Link>
                    <Link href="/menu" className={`${styles.link} ${pathname === '/menu' ? styles.activeLink : ''}`}>
                        Menu
                    </Link>
                    <Link href="/about" className={`${styles.link} ${pathname === '/about' ? styles.activeLink : ''}`}>
                        About Us
                    </Link>
                    <Link href="/tracking" className={`${styles.link} ${pathname === '/tracking' ? styles.activeLink : ''}`}>
                        Track Order
                    </Link>
                    <Link href="/contact" className={`${styles.link} ${pathname === '/contact' ? styles.activeLink : ''}`}>
                        Contact
                    </Link>
                    {isAdmin && (
                        <Link href="/admin" className={styles.link}>
                            Admin Panel
                        </Link>
                    )}
                </nav>

                <div className={styles.actions}>
                    <button
                        className={styles.hamburger}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                    </button>

                    <div className={styles.searchContainer} onClick={(e) => e.stopPropagation()}>
                        {showSearch && (
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Search menu..."
                                    className={styles.searchInput}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent) => {
                                        if (e.key === 'Enter') {
                                            router.push('/menu');
                                            setShowSearch(false);
                                        }
                                    }}
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        )}
                        <button
                            className={`${styles.iconBtn} ${showSearch ? styles.active : ''}`}
                            aria-label="Search"
                            onClick={() => {
                                if (showSearch && searchQuery) {
                                    router.push('/menu');
                                    setShowSearch(false);
                                } else {
                                    setShowSearch(!showSearch);
                                }
                            }}
                        >
                            <Search size={22} />
                        </button>

                        {showSearch && searchQuery.trim() && (
                            <div className={styles.searchResults}>
                                {filteredResults.length > 0 ? (
                                    filteredResults.map((item) => (
                                        <Link
                                            key={item.id}
                                            href="/menu"
                                            className={styles.searchResultItem}
                                            onClick={() => {
                                                setShowSearch(false);
                                                setSearchQuery('');
                                            }}
                                        >
                                            <img src={item.image} alt={item.name} className={styles.resultImage} />
                                            <div className={styles.resultInfo}>
                                                <span className={styles.resultName}>{item.name}</span>
                                                <span className={styles.resultCategory}>{item.category}</span>
                                                <span className={styles.resultPrice}>₦{item.price.toLocaleString()}</span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className={styles.noResults}>
                                        No items found for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Link href="/cart" className={`${styles.iconBtn} ${styles.cartBtn}`} aria-label="Cart">
                        <ShoppingBag size={22} />
                        {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                    </Link>

                    <Link href="/favorites" className={styles.iconBtn} aria-label="Favorites">
                        <Heart size={22} className={favorites.length > 0 ? styles.heartFilled : ''} />
                        {favorites.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
                    </Link>

                    {isAuthenticated || isAdmin ? (
                        <div className={styles.userProfile}>
                            <Link href="/profile" className={styles.accountButton}>
                                <div className={styles.avatar}>
                                    <User size={18} />
                                </div>
                                <span className={styles.userName}>{isAdmin ? 'Admin' : (user?.name?.split(' ')[0] || 'Account')}</span>
                            </Link>
                            <button
                                className={styles.logoutIconButton}
                                onClick={handleLogout}
                                aria-label="Logout"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth" className={styles.loginBtn}>
                            LOGIN
                        </Link>
                    )}
                </div>
            </div>


            {/* Mobile Menu Overlay */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
                <nav className={styles.mobileNav}>
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link href="/menu" onClick={() => setIsMenuOpen(false)}>Menu</Link>
                    <Link href="/favorites" onClick={() => setIsMenuOpen(false)}>My Favorites</Link>
                    <Link href="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                    <Link href="/contact" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
                    <Link href="/tracking" onClick={() => setIsMenuOpen(false)}>Track Order</Link>
                    {isAdmin && <Link href="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>}
                    {isAuthenticated || isAdmin ? (
                        <>
                            <Link href="/profile" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                            <button className={styles.mobileLogoutBtn} onClick={() => { handleLogout(); setIsMenuOpen(false); }}>LOGOUT</button>
                        </>
                    ) : (
                        <Link href="/auth" onClick={() => setIsMenuOpen(false)}>Login</Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
