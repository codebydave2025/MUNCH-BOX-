'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Users,
    RefreshCw,
    Star,
    Printer
} from 'lucide-react';
import styles from './reports.module.css';

interface Order {
    id: string;
    total: number;
    status: string;
    date: string;
    items: { category: string; name: string; quantity: number; price: number }[];
}

export default function ReportsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('This Month');
    const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, reviewsRes] = await Promise.all([
                fetch('/api/orders'),
                fetch('/api/reviews')
            ]);

            const ordersData = await ordersRes.json();
            const reviewsData = await reviewsRes.json();

            setOrders(ordersData);
            setReviews(reviewsData);
        } catch (error) {
            console.error('Reports fetch failed', error);
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
            const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
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

    const filteredOrders = useMemo(() => {
        return orders.filter(o => isWithinRange(o.date));
    }, [orders, timeRange, customDate]);

    const totalRevenue = filteredOrders.reduce((s: number, o: Order) => s + o.total, 0);
    const completedOrdersValue = filteredOrders.filter((o: Order) => o.status === 'delivered' || o.status === 'completed').length;

    // Category Breakdown
    const categoryMap: Record<string, number> = {};
    const itemMap: Record<string, { qty: number; revenue: number }> = {};

    filteredOrders.forEach((order: Order) => {
        order.items.forEach((item: any) => {
            const cat = item.category || 'Other';
            categoryMap[cat] = (categoryMap[cat] || 0) + (item.price * item.quantity);

            const name = item.name;
            if (!itemMap[name]) itemMap[name] = { qty: 0, revenue: 0 };
            itemMap[name].qty += item.quantity;
            itemMap[name].revenue += (item.price * item.quantity);
        });
    });

    const categoryList = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .map(([label, value]) => ({
            label,
            value: Math.floor((value / totalRevenue) * 100),
            revenue: value
        }));

    const topItems = Object.entries(itemMap)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(([name, data]) => ({ name, ...data }));

    // Review Stats
    const filteredReviews = reviews.filter(r => isWithinRange(r.date));
    const avgRating = filteredReviews.length > 0
        ? (filteredReviews.reduce((s, r) => s + r.rating, 0) / filteredReviews.length).toFixed(1)
        : '0.0';

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: filteredReviews.filter(r => r.rating === star).length,
        percent: filteredReviews.length > 0
            ? Math.floor((filteredReviews.filter(r => r.rating === star).length / filteredReviews.length) * 100)
            : 0
    }));

    if (loading) {
        return (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
                <RefreshCw className={styles.spinner} size={40} />
                <p>Generating Reports...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
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

            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <h2 className={styles.title}>Reports & Analytics</h2>
                    <p className={styles.subtitle}>Insights derived from {filteredOrders.length} orders ({timeRange})</p>
                </div>
                <button className={styles.printBtn} onClick={() => window.print()} title="Print Analytics Report">
                    <Printer size={18} />
                    <span>Print Report</span>
                </button>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiInner}>
                        <div className={styles.kpiInfo}>
                            <span className={styles.kpiLabel}>Total Revenue</span>
                            <h3 className={styles.kpiValue}>₦{totalRevenue.toLocaleString()}</h3>
                            <div className={`${styles.kpiTrend} ${styles.positive}`}>
                                <ArrowUpRight size={14} /> <span>Live Data</span>
                            </div>
                        </div>
                        <div className={styles.kpiIcon}><BarChart3 size={24} /></div>
                    </div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiInner}>
                        <div className={styles.kpiInfo}>
                            <span className={styles.kpiLabel}>Total Orders</span>
                            <h3 className={styles.kpiValue}>{filteredOrders.length}</h3>
                        </div>
                        <div className={styles.kpiIcon}><Package size={24} /></div>
                    </div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiInner}>
                        <div className={styles.kpiInfo}>
                            <span className={styles.kpiLabel}>Completed Orders</span>
                            <h3 className={styles.kpiValue}>{completedOrdersValue}</h3>
                        </div>
                        <div className={styles.kpiIcon}><TrendingUp size={24} /></div>
                    </div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiInner}>
                        <div className={styles.kpiInfo}>
                            <span className={styles.kpiLabel}>Avg. Customer Rating</span>
                            <h3 className={styles.kpiValue} style={{ color: parseFloat(avgRating) >= 4 ? '#10b981' : '#f59e0b' }}>
                                {avgRating} <span style={{ fontSize: '0.9rem', color: '#888' }}>/ 5.0</span>
                            </h3>
                        </div>
                        <div className={styles.kpiIcon}><Star size={24} color="#FF7A00" fill="#FF7A00" /></div>
                    </div>
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Revenue by Category (%)</h3>
                    </div>
                    <div className={styles.categoryBars}>
                        {categoryList.map((item, i) => (
                            <div key={i} className={styles.barItem} title={`₦${item.revenue.toLocaleString()}`}>
                                <div className={styles.barLabel}>
                                    <span>{item.label}</span>
                                    <span>{item.value}%</span>
                                </div>
                                <div className={styles.barContainer}>
                                    <div
                                        className={styles.barFill}
                                        style={{ width: `${item.value}%`, backgroundColor: i === 0 ? '#D92323' : '#666' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Rating Distribution</h3>
                    </div>
                    <div className={styles.categoryBars}>
                        {ratingCounts.map((item, i) => (
                            <div key={i} className={styles.barItem}>
                                <div className={styles.barLabel}>
                                    <span>{item.star} Stars ({item.count})</span>
                                    <span>{item.percent}%</span>
                                </div>
                                <div className={styles.barContainer}>
                                    <div
                                        className={styles.barFill}
                                        style={{ width: `${item.percent}%`, backgroundColor: item.star >= 4 ? '#10b981' : item.star >= 3 ? '#f59e0b' : '#D92323' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
