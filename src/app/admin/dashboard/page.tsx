'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    RefreshCw,
    Calendar,
    ChevronDown
} from 'lucide-react';
import styles from './dashboard.module.css';

interface Order {
    id: string;
    customer: { name: string };
    items: any[];
    total: number;
    status: string;
    date: string;
}

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('This Week');
    const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
    const [stats, setStats] = useState([
        { label: 'Total Revenue', value: '₦0', change: '0%', isPositive: true, icon: DollarSign },
        { label: 'Total Orders', value: '0', change: '0%', isPositive: true, icon: ShoppingCart },
        { label: 'Avg Order Value', value: '₦0', change: '0%', isPositive: true, icon: TrendingUp },
        { label: 'Completed Orders', value: '0', detail: '0% of total', isPositive: true, icon: Package },
    ]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const [ordersRes, reviewsRes] = await Promise.all([
                fetch('/api/orders?t=' + Date.now()),
                fetch('/api/reviews?t=' + Date.now())
            ]);

            const ordersData = await ordersRes.json();
            const reviewsData = await reviewsRes.json();

            setOrders(ordersData);
            setReviews(reviewsData);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const isWithinRange = (orderDate: string) => {
        const date = new Date(orderDate);
        const now = new Date();
        now.setHours(23, 59, 59, 999);

        if (timeRange === 'Today') {
            return date.toDateString() === now.toDateString();
        }
        if (timeRange === 'This Week') {
            const startOfWeek = new Date(now);
            const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // Adjust to Monday
            startOfWeek.setDate(now.getDate() - day);
            startOfWeek.setHours(0, 0, 0, 0);
            return date >= startOfWeek && date <= now;
        }
        if (timeRange === 'This Month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return date >= startOfMonth && date <= now;
        }
        if (timeRange === 'Custom') {
            return date.toDateString() === new Date(customDate).toDateString();
        }
        return true;
    };

    const filteredOrdersByRange = useMemo(() => {
        return orders.filter(o => isWithinRange(o.date));
    }, [orders, timeRange, customDate]);

    useEffect(() => {
        if (!loading) {
            calculateStats(filteredOrdersByRange);
        }
    }, [filteredOrdersByRange, loading]);

    const calculateStats = (allOrders: Order[]) => {
        const totalRevenue = allOrders.reduce((acc, curr) => acc + curr.total, 0);
        const totalOrders = allOrders.length;
        const avgValue = totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0;
        const avgRating = reviews.length > 0
            ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
            : '0.0';

        setStats([
            { label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, change: '+12.5%', isPositive: true, icon: DollarSign },
            { label: 'Total Orders', value: totalOrders.toString(), change: '+8.2%', isPositive: true, icon: ShoppingCart },
            { label: 'Avg Order Value', value: `₦${avgValue.toLocaleString()}`, change: '+2.4%', isPositive: true, icon: TrendingUp },
            { label: 'Customer Rating', value: `${avgRating} / 5.0`, detail: `${reviews.length} total reviews`, isPositive: parseFloat(avgRating) >= 4, icon: Package },
        ]);
    };

    const trendData = useMemo(() => {
        const now = new Date();
        let points: number[] = [];
        let labels: string[] = [];

        if (timeRange === 'Today' || timeRange === 'Custom') {
            labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
            points = new Array(7).fill(0);
            filteredOrdersByRange.forEach(o => {
                const hour = new Date(o.date).getHours();
                const index = Math.floor(hour / 4);
                points[index] += o.total;
            });
        } else if (timeRange === 'This Week') {
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            points = new Array(7).fill(0);
            filteredOrdersByRange.forEach(o => {
                const day = new Date(o.date).getDay();
                const index = day === 0 ? 6 : day - 1;
                points[index] += o.total;
            });
        } else {
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            points = new Array(4).fill(0);
            filteredOrdersByRange.forEach(o => {
                const day = new Date(o.date).getDate();
                const week = Math.floor((day - 1) / 7);
                if (week < 4) points[week] += o.total;
            });
        }

        // Generate SVG Path
        const maxVal = Math.max(...points, 1000);
        const height = 150;
        const width = 400;
        const step = width / (points.length - 1);

        let pathD = `M 0 ${height - (points[0] / maxVal) * height}`;
        points.forEach((p, i) => {
            if (i === 0) return;
            pathD += ` L ${i * step} ${height - (p / maxVal) * height}`;
        });

        return { pathD, labels, points };
    }, [filteredOrdersByRange, timeRange, customDate]);

    const [activeOrderTab, setActiveOrderTab] = useState<'today' | 'history'>('today');

    // Filter orders for today
    const todayOrders = useMemo(() => {
        const now = new Date();
        return orders.filter(o => {
            if (!o.date) return false;
            const d = new Date(o.date);
            return d.toDateString() === now.toDateString();
        });
    }, [orders]);

    // History is basically all orders (or at least the most recent ones)
    const historyOrders = useMemo(() => {
        return [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    }, [orders]);

    const displayedOrders = activeOrderTab === 'today' ? todayOrders : filteredOrdersByRange.slice(0, 10);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
                <RefreshCw className={styles.spinner} />
                <p>Loading Dashboard...</p>
            </div>
        );
    }


    return (
        <div className={styles.dashboard}>
            {/* Global Time Range Selector */}
            <div className={styles.rangeHeader}>
                <div className={styles.rangeSelector}>
                    {['Today', 'This Week', 'This Month', 'Custom'].map((range) => (
                        <button
                            key={range}
                            className={`${styles.rangeBtn} ${timeRange === range ? styles.rangeBtnActive : ''}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range}
                        </button>
                    ))}
                </div>
                {timeRange === 'Custom' && (
                    <div className={styles.customPicker}>
                        <Calendar size={16} />
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            className={styles.dateInput}
                        />
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className={styles.statsGrid}>
                {stats.map((stat: any, index: number) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={styles.statIconWrapper}>
                                    <Icon size={20} className={styles.statIcon} />
                                </div>
                                {stat.change && stat.change !== '0%' && (
                                    <div className={`${styles.statChange} ${stat.isPositive ? styles.positive : styles.negative}`}>
                                        {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        <span>{stat.change}</span>
                                    </div>
                                )}
                            </div>
                            <div className={styles.statContent}>
                                <span className={styles.statLabel}>{stat.label}</span>
                                <h3 className={styles.statValue}>{stat.value}</h3>
                                {stat.detail && <span className={styles.statDetail}>{stat.detail}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <h3>Sales Trend ({timeRange})</h3>
                    </div>
                    <div className={styles.chartPlaceholder}>
                        <svg width="100%" height="150" viewBox="0 0 400 150" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#D92323" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#D92323" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d={trendData.pathD}
                                fill="none"
                                stroke="#D92323"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d={`${trendData.pathD} L 400 150 L 0 150 Z`}
                                fill="url(#trendGradient)"
                            />
                        </svg>
                        <div className={styles.chartXLabels}>
                            {trendData.labels.map((l, i) => <span key={i}>{l}</span>)}
                        </div>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <h3>Top Items</h3>
                        <Link href="/admin/items" className={styles.iconBtn}><MoreVertical size={16} /></Link>
                    </div>
                    <div className={styles.itemsList}>
                        {filteredOrdersByRange.length > 0 ? (
                            Object.entries(filteredOrdersByRange.flatMap(o => o.items).reduce((acc: any, item: any) => {
                                acc[item.name] = (acc[item.name] || 0) + item.quantity;
                                return acc;
                            }, {}))
                                .sort((a: any, b: any) => b[1] - a[1])
                                .slice(0, 4)
                                .map(([name, sales]: any, i) => (
                                    <div key={i} className={styles.topItemRow}>
                                        <div className={styles.itemInfo}>
                                            <span className={styles.itemName}>{name}</span>
                                            <span className={styles.itemSales}>{sales} sold</span>
                                        </div>
                                        <div className={styles.itemRevenue}>
                                            <span>₦{((orders.flatMap(o => o.items).find(it => it.name === name)?.price || 0) * sales).toLocaleString()}</span>
                                            <div className={styles.stockStatus}>
                                                <div
                                                    className={styles.stockBar}
                                                    style={{ width: '100%', backgroundColor: '#10b981' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <p style={{ padding: '1rem', color: '#888' }}>No sales data yet</p>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerTabs}>
                        <button
                            className={`${styles.tabBtn} ${activeOrderTab === 'today' ? styles.tabBtnActive : ''}`}
                            onClick={() => setActiveOrderTab('today')}
                        >
                            Today's Activity ({todayOrders.length})
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeOrderTab === 'history' ? styles.tabBtnActive : ''}`}
                            onClick={() => setActiveOrderTab('history')}
                        >
                            Order History
                        </button>
                    </div>
                    <Link href="/admin/orders" className={styles.viewAll}>View Full List</Link>
                </div>
                <div className={styles.tableWrapper}>
                    {displayedOrders.length > 0 ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className={styles.orderId}>#{order.id}</td>
                                        <td className={styles.customerName}>{order.customer.name}</td>
                                        <td className={styles.orderTotal}>₦{order.total.toLocaleString()}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className={styles.orderTime}>{new Date(order.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyState}>
                            <ShoppingCart size={40} />
                            <p>{activeOrderTab === 'today' ? "No orders placed yet today." : "No order history found."}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
