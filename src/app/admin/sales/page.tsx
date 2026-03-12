'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Calendar,
    Filter,
    Eye,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    Printer
} from 'lucide-react';
import styles from './sales.module.css';

interface Order {
    id: string;
    customer: { name: string };
    items: any[];
    total: number;
    status: string;
    date: string;
}

export default function SalesPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [timeFilter, setTimeFilter] = useState('This Week');
    const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = useMemo(() => {
        const isWithinRange = (orderDate: string) => {
            const date = new Date(orderDate);
            const now = new Date();
            now.setHours(23, 59, 59, 999);

            if (timeFilter === 'Today') {
                return date.toDateString() === now.toDateString();
            }
            if (timeFilter === 'This Week') {
                const startOfWeek = new Date(now);
                const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
                startOfWeek.setDate(now.getDate() - day);
                startOfWeek.setHours(0, 0, 0, 0);
                return date >= startOfWeek && date <= now;
            }
            if (timeFilter === 'This Month') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return date >= startOfMonth && date <= now;
            }
            if (timeFilter === 'Custom') {
                return date.toDateString() === new Date(customDate).toDateString();
            }
            return true;
        };

        return orders.filter(sale => {
            // Time filtering
            const matchesTime = isWithinRange(sale.date);

            // Search filtering
            const matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

            // Status filtering
            const matchesStatus = statusFilter === 'All' ||
                (statusFilter === 'Completed' && (sale.status === 'delivered' || sale.status === 'completed')) ||
                (statusFilter === 'Cancelled' && sale.status === 'cancelled');

            return matchesTime && matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter, timeFilter, customDate]);

    const stats = useMemo(() => {
        const totalGross = filteredSales.reduce((sum, o) => sum + o.total, 0);
        const cancelledTotal = filteredSales.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + o.total, 0);
        const netSales = totalGross - cancelledTotal;
        const totalOrders = filteredSales.length;

        return { totalGross, cancelledTotal, netSales, totalOrders };
    }, [filteredSales]);

    if (loading && orders.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem', padding: '5rem' }}>
                <RefreshCw className={styles.spinner} size={40} />
                <p>Loading Sales Data...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Global Time Range Selector */}
            <div className={styles.rangeHeader}>
                <div className={styles.rangeSelector}>
                    {['Today', 'This Week', 'This Month', 'Custom', 'All Time'].map((range) => (
                        <button
                            key={range}
                            className={`${styles.rangeBtn} ${timeFilter === range ? styles.rangeBtnActive : ''}`}
                            onClick={() => setTimeFilter(range)}
                        >
                            {range}
                        </button>
                    ))}
                </div>
                {timeFilter === 'Custom' && (
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

            {/* Filters and Actions */}
            <div className={styles.actionBar}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search order ID or customer..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.actions}>
                    <button className={styles.refreshBtn} onClick={fetchOrders} title="Refresh Data">
                        <RefreshCw size={18} />
                    </button>
                    <button className={styles.printBtn} onClick={() => window.print()} title="Print Sales Report">
                        <Printer size={18} />
                        <span>Print Report</span>
                    </button>
                </div>
            </div>

            {/* Sales Summary Grid */}
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Gross Sales</span>
                    <h3 className={styles.summaryValue}>₦{stats.totalGross.toLocaleString()}</h3>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Cancelled/Refunded</span>
                    <h3 className={styles.summaryValue} style={{ color: '#ef4444' }}>-₦{stats.cancelledTotal.toLocaleString()}</h3>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Net Sales</span>
                    <h3 className={styles.summaryValue}>₦{stats.netSales.toLocaleString()}</h3>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Total Orders</span>
                    <h3 className={styles.summaryValue}>{stats.totalOrders}</h3>
                </div>
            </div>

            {/* Receipts Table */}
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <div className={styles.filterTabs}>
                        {['All', 'Completed', 'Cancelled'].map(tab => (
                            <button
                                key={tab}
                                className={`${styles.tab} ${statusFilter === tab ? styles.tabActive : ''}`}
                                onClick={() => setStatusFilter(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date & Time</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.length > 0 ? filteredSales.map((sale) => (
                                <tr key={sale.id}>
                                    <td className={styles.receiptId}>#{sale.id}</td>
                                    <td>
                                        <div className={styles.dateTime}>
                                            <span>{new Date(sale.date).toLocaleDateString()}</span>
                                            <span className={styles.time}>
                                                <Clock size={12} /> {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.customer}>{sale.customer.name}</td>
                                    <td className={styles.itemsCount}>{sale.items.length} items</td>
                                    <td className={styles.amount}>₦{sale.total.toLocaleString()}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[sale.status.toLowerCase()] || ''}`}>
                                            {(sale.status === 'delivered' || sale.status === 'completed') ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.iconBtn} title="View Details" onClick={() => window.location.href = `/admin/orders?search=${sale.id}`}>
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                                        No sales records found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.pagination}>
                    <span className={styles.paginationInfo}>Showing {filteredSales.length} records</span>
                </div>
            </div>
        </div>
    );
}
