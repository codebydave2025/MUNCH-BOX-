'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Check,
  X,
  Clock,
  User,
  Phone,
  MapPin,
  Package,
  Truck,
  Search,
  Filter,
  RefreshCw,
  Calendar
} from 'lucide-react';
import styles from './orders.module.css';

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  };
  items: Array<{
    id: number | string;
    name: string;
    price: number;
    quantity: number;
    mealGroup?: string;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'packaging' | 'dispatched' | 'delivered' | 'cancelled';
  date: string;
}

const ORDER_STATUSES: { id: Order['status']; label: string; color: string; icon: any }[] = [
  { id: 'pending', label: 'Pending Review', color: '#f59e0b', icon: Clock },
  { id: 'confirmed', label: 'Confirmed', color: '#3b82f6', icon: Check },
  { id: 'packaging', label: 'Packaging', color: '#8b5cf6', icon: Package },
  { id: 'dispatched', label: 'Dispatched', color: '#06b6d4', icon: Truck },
  { id: 'delivered', label: 'Delivered', color: '#10b981', icon: Check },
  { id: 'cancelled', label: 'Cancelled', color: '#ef4444', icon: X },
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const globalSearch = searchParams.get('search');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('All');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => loadOrders(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsSyncing(true);
    try {
      const response = await fetch('/api/orders?t=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        let data = await response.json();
        if (Array.isArray(data)) {
          // Filter out malformed orders
          data = data.filter((o: any) => o && o.id);
          // Always sort by date descending to show newest first
          data.sort((a: any, b: any) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          });
          setOrders(data);
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        // Rollback on error
        loadOrders(true);
        alert('Failed to update status. Please try again.');
      } else {
        // Silent refresh to ensure sync
        loadOrders(true);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      loadOrders(true);
    }
  };

  const isWithinRange = (orderDate: string) => {
    if (timeRange === 'All') return true;
    if (!orderDate) return true;
    const date = new Date(orderDate);
    if (isNaN(date.getTime())) return true;
    const now = new Date();

    if (timeRange === 'Today') {
      // Robust Today: same calendar day OR within last 12 hours (to handle timezone shifts)
      const sameDay = date.toDateString() === now.toDateString();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      return sameDay || date >= twelveHoursAgo;
    }
    if (timeRange === 'This Week') {
      const startOfWeek = new Date(now);
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
      startOfWeek.setDate(now.getDate() - day);
      startOfWeek.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    }
    if (timeRange === 'This Month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfMonth;
    }
    if (timeRange === 'Custom') {
      return date.toDateString() === new Date(customDate).toDateString();
    }
    return true;
  };

  const statusStats = useMemo(() => {
    const stats: Record<string, number> = { all: 0 };
    ORDER_STATUSES.forEach(s => stats[s.id] = 0);

    orders.forEach(order => {
      // Pending orders count everywhere regardless of date range
      const isPending = order.status === 'pending';
      if (isPending || isWithinRange(order.date)) {
        stats.all++;
        if (stats[order.status] !== undefined) {
          stats[order.status]++;
        }
      }
    });
    return stats;
  }, [orders, timeRange, customDate]);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch =
      (order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Pending orders should ALWAYS show up unless searched/filtered for another status
    // If the user has 'This Week' selected, but there's a pending order from last week or today, they should see it.
    const matchesRange = (timeRange === 'All' || order.status === 'pending') ? true : isWithinRange(order.date);

    return matchesFilter && matchesSearch && matchesRange;
  });

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <RefreshCw className={styles.spinner} />
        <p>Syncing orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Global Time Range Selector */}
      <div className={styles.rangeHeader}>
        <div className={styles.rangeSelector}>
          {['All', 'Today', 'This Week', 'This Month', 'Custom'].map((range) => (
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

      {/* Status Overview Cards */}
      <div className={styles.statusOverview}>
        <div
          className={`${styles.statusCard} ${filter === 'all' ? styles.statusCardActive : ''}`}
          onClick={() => setFilter('all')}
        >
          <div className={styles.statusHeader_small}>
            <div className={styles.statusIconWrapper_small} style={{ backgroundColor: '#f3f4f6', color: '#666' }}>
              <Filter size={16} />
            </div>
            <span className={styles.statusCount}>{statusStats.all}</span>
          </div>
          <span className={styles.statusLabel}>All Orders</span>
        </div>
        {ORDER_STATUSES.map((status) => {
          const Icon = status.icon;
          return (
            <div
              key={status.id}
              className={`${styles.statusCard} ${filter === status.id ? styles.statusCardActive : ''}`}
              onClick={() => setFilter(status.id)}
            >
              <div className={styles.statusHeader_small}>
                <div className={styles.statusIconWrapper_small} style={{ backgroundColor: status.color + '15', color: status.color }}>
                  <Icon size={16} />
                </div>
                <span className={styles.statusCount}>{statusStats[status.id]}</span>
              </div>
              <span className={styles.statusLabel}>{status.label}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.actionBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', marginRight: '10px' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button onClick={() => loadOrders(false)} className={styles.refreshBtn}>
          <RefreshCw size={18} className={isSyncing ? styles.spinner : ''} />
        </button>
      </div>

      <div className={styles.ordersGrid}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} />
            <h3>No orders found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderIdInfo}>
                  <span className={styles.orderLabel}>Order ID</span>
                  <h3 className={styles.orderId}>#{order.id}</h3>
                </div>
                <div
                  className={styles.statusBadge}
                  style={{
                    backgroundColor: ORDER_STATUSES.find(s => s.id === order.status)?.color + '15',
                    color: ORDER_STATUSES.find(s => s.id === order.status)?.color
                  }}
                >
                  {ORDER_STATUSES.find(s => s.id === order.status)?.label}
                </div>
              </div>

              <div className={styles.orderDate}>
                <Clock size={14} />
                <span>{new Date(order.date).toLocaleString()}</span>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Customer Details</h4>
                <div className={styles.customerInfo}>
                  <div className={styles.infoLine}>
                    <User size={14} /> <strong>{order.customer.name}</strong>
                  </div>
                  <div className={styles.infoLine}>
                    <Phone size={14} /> <span>{order.customer.phone}</span>
                  </div>
                  <div className={styles.infoLine}>
                    <MapPin size={14} /> <span>{order.customer.address}</span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Order Items</h4>
                <div className={styles.itemsList}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemDetail}>
                        <span>{item.quantity}x {item.name}</span>
                        {item.mealGroup && <span className={styles.mealGroupTag}>{item.mealGroup}</span>}
                      </div>
                      <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className={styles.totalRow}>
                    <span>Total</span>
                    <span>₦{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className={styles.btnConfirm}>
                      <Check size={16} /> Confirm
                    </button>
                    <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className={styles.btnCancel}>
                      <X size={16} /> Reject
                    </button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button onClick={() => updateOrderStatus(order.id, 'packaging')} className={styles.btnProcess}>
                    <Package size={16} /> Start Packaging
                  </button>
                )}
                {order.status === 'packaging' && (
                  <button onClick={() => updateOrderStatus(order.id, 'dispatched')} className={styles.btnDispatch}>
                    <Truck size={16} /> Dispatch
                  </button>
                )}
                {order.status === 'dispatched' && (
                  <button onClick={() => updateOrderStatus(order.id, 'delivered')} className={styles.btnDeliver}>
                    <Check size={16} /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}