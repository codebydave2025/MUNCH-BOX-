'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Star,
    Phone,
    Mail,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import styles from './customers.module.css';

interface Customer {
    name: string;
    phone: string;
    visits: number;
    spent: number;
    lastVisit: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders');
            const orders = await res.json();

            // Extract unique customers from orders
            const customerMap: Record<string, Customer> = {};

            orders.forEach((order: any) => {
                const phone = order.customer.phone;
                if (!customerMap[phone]) {
                    customerMap[phone] = {
                        name: order.customer.name,
                        phone: phone,
                        visits: 0,
                        spent: 0,
                        lastVisit: order.date
                    };
                }

                customerMap[phone].visits += 1;
                customerMap[phone].spent += order.total;
                if (new Date(order.date) > new Date(customerMap[phone].lastVisit)) {
                    customerMap[phone].lastVisit = order.date;
                }
            });

            setCustomers(Object.values(customerMap));
        } catch (error) {
            console.error('Failed to fetch orders for customer data', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(cust =>
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.phone.includes(searchTerm)
    );

    if (loading) {
        return (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
                <RefreshCw className={styles.spinner} size={40} />
                <p>Loading Customer Records...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* KPI Cards */}
            <div className={styles.topGrid}>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Unique Customers</span>
                    <h3 className={styles.kpiValue}>{customers.length}</h3>
                </div>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Total Returning</span>
                    <h3 className={styles.kpiValue}>{customers.filter(c => c.visits > 1).length}</h3>
                </div>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Avg. Spend</span>
                    <h3 className={styles.kpiValue}>
                        ₦{customers.length > 0 ? Math.floor(customers.reduce((s, c) => s + c.spent, 0) / customers.length).toLocaleString() : 0}
                    </h3>
                </div>
            </div>

            <div className={styles.actionBar}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Phone</th>
                                <th>Visits</th>
                                <th>Total Spent</th>
                                <th>Last Visit</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((cust, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className={styles.custInfo}>
                                            <div className={styles.avatar}>{cust.name.charAt(0)}</div>
                                            <div className={styles.nameText}>
                                                <span className={styles.name}>{cust.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.contacts}>
                                            <div className={styles.contactItem}><Phone size={12} /> {cust.phone}</div>
                                        </div>
                                    </td>
                                    <td><span className={styles.visits}>{cust.visits}</span></td>
                                    <td><span className={styles.spent}>₦{cust.spent.toLocaleString()}</span></td>
                                    <td><span className={styles.lastVisit}>{new Date(cust.lastVisit).toLocaleDateString()}</span></td>
                                    <td>
                                        <button className={styles.viewBtn} onClick={() => window.location.href = `/admin/orders?search=${cust.phone}`}>
                                            <ChevronRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
