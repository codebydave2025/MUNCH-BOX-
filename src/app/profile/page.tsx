'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('current_user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchUserOrders(parsedUser);
        } else {
            router.push('/auth');
        }
    }, [router]);

    const fetchUserOrders = async (currentUser: any) => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const allOrders = await res.json();
                // Filter orders by customer name or phone (since email isn't always in order object)
                const userOrders = allOrders.filter((o: any) =>
                    o.customer.name.toLowerCase() === currentUser.name.toLowerCase() ||
                    o.customer.phone === currentUser.phone
                );
                setOrders(userOrders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
        } catch (err) {
            console.error('Failed to fetch user orders', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user || loading) return <div className={styles.emptyState}>Loading Your Profile...</div>;

    const today = new Date().toDateString();
    const todayOrder = orders.find(o => new Date(o.date).toDateString() === today);
    const activity = orders.filter(o => o.id !== todayOrder?.id).slice(0, 5);

    return (
        <main className={styles.main}>
            <div className={`container ${styles.dashboardContainer}`}>
                <div className={styles.dashboardGrid}>
                    {/* Left Sidebar - Profile Info */}
                    <aside className={styles.profileSidebar}>
                        <div className={styles.profileCard}>
                            <div className={styles.avatar}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className={styles.userName}>{user.name}</h2>
                            <p className={styles.userEmail}>{user.email}</p>
                            <div className={styles.memberBadge}>Member Since {new Date(user.createdAt || Date.now()).getFullYear()}</div>

                            <div className={styles.userInfoList}>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>Phone:</span>
                                    <span className={styles.value}>{user.phone || 'N/A'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>User ID:</span>
                                    <span className={styles.value}>#{user.id ? user.id.slice(-6) : 'N/A'}</span>
                                </div>
                            </div>

                            <div className={styles.quickActions}>
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => router.push('/menu')}
                                >
                                    Start New Order
                                </button>
                                <button
                                    className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                                    onClick={() => router.push('/tracking')}
                                >
                                    Track Order
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className={styles.dashboardContent}>
                        <header className={styles.dashboardHeader}>
                            <h1>Welcome back, {user.name.split(' ')[0]}! 👋</h1>
                            <p>Ready for some good food to set the mood?</p>
                        </header>

                        {/* Today's Order */}
                        <div className={styles.section}>
                            <h3>Today's Order</h3>
                            {todayOrder ? (
                                <div className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <span className={styles.orderId}>#{todayOrder.id}</span>
                                        <span className={`${styles.orderStatus} ${styles[todayOrder.status.toLowerCase()]}`}>
                                            {todayOrder.status}
                                        </span>
                                    </div>
                                    <div className={styles.orderItems}>
                                        {todayOrder.items.slice(0, 3).map((item: any, i: number) => (
                                            <div key={i} className={styles.itemLine}>
                                                <span>{item.quantity}x {item.name}</span>
                                                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {todayOrder.items.length > 3 && (
                                            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>+ {todayOrder.items.length - 3} more items...</p>
                                        )}
                                    </div>
                                    <div className={styles.totalAmount}>
                                        <span>Total</span>
                                        <span>₦{todayOrder.total.toLocaleString()}</span>
                                    </div>
                                    <button
                                        className={styles.actionBtn}
                                        style={{ marginTop: '0.5rem' }}
                                        onClick={() => router.push(`/tracking/${todayOrder.id}`)}
                                    >
                                        Track Live Status
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>You haven't placed any orders yet today.</p>
                                    <span className={styles.hint}>Hungry? Check out our menu!</span>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className={styles.section}>
                            <h3>Recent Activity</h3>
                            <div className={styles.activityList}>
                                {activity.length > 0 ? (
                                    activity.map((order: any) => (
                                        <div key={order.id} className={styles.activityItem}>
                                            <div className={styles.activityInfo}>
                                                <h4>Order #{order.id}</h4>
                                                <p>{new Date(order.date).toLocaleDateString()} • {order.items.length} items</p>
                                            </div>
                                            <div className={styles.activityTotal}>
                                                ₦{order.total.toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyState} style={{ padding: '2rem' }}>
                                        <p>No recent activity found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
