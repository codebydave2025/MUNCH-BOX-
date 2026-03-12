'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Phone, User, Package, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

const ORDER_STATUSES = [
    { id: 'pending', label: 'Payment Confirmation', description: 'Awaiting payment verification', icon: '💳' },
    { id: 'confirmed', label: 'Order Confirmed', description: 'Payment verified, preparing your order', icon: '✅' },
    { id: 'packaging', label: 'Food Packaging', description: 'Your order is being carefully packaged', icon: '📦' },
    { id: 'dispatched', label: 'Order Dispatched', description: 'Your order has been sent out for delivery', icon: '🚚' },
    { id: 'delivered', label: 'Order Delivered', description: 'Your order has reached you. Enjoy!', icon: '🎉' }
];

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/orders/${id}`);
            if (response.ok) {
                const data = await response.json();
                setOrder(data);
                setError('');
            } else {
                setError('Order not found');
            }
        } catch (err) {
            setError('Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();

        // Poll for updates every 5 seconds
        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const getCurrentStatusIndex = (status: string) => {
        return ORDER_STATUSES.findIndex(s => s.id === status);
    };

    const getStatusClass = (statusId: string, currentStatus: string) => {
        if (currentStatus === 'cancelled') return styles.pending;
        const currentIndex = getCurrentStatusIndex(currentStatus);
        const statusIndex = getCurrentStatusIndex(statusId);

        if (statusIndex < currentIndex) return styles.completed;
        if (statusIndex === currentIndex) return styles.active;
        return styles.pending;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Fetching your order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className={styles.errorContainer}>
                <h1>Oops!</h1>
                <p>{error || 'Order not found'}</p>
                <button onClick={() => router.push('/tracking')} className={styles.backBtn}>
                    <ArrowLeft size={20} /> Back to Tracking
                </button>
            </div>
        );
    }

    return (
        <main className={styles.main}>
            <div className="container">
                <button onClick={() => router.push('/tracking')} className={styles.backLink}>
                    <ArrowLeft size={20} /> Back to Tracking
                </button>

                <div className={styles.layout}>
                    {/* Left Column: Tracking Progress */}
                    <div className={styles.trackingColumn}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.orderIdentity}>
                                    <span className={styles.orderLabel}>Order ID</span>
                                    <h2 className={styles.orderId}>#{order.id}</h2>
                                </div>
                                <div className={styles.orderTime}>
                                    <Clock size={16} />
                                    <span>Placed on {new Date(order.date).toLocaleString()}</span>
                                </div>
                                {['confirmed', 'packaging'].includes(order.status) && (
                                    <div className={styles.etdAlert}>
                                        <Clock size={18} />
                                        <span>Estimated Wait Time: <strong>{(() => {
                                            const specialNames = ['noodles', 'french fries', 'yam strips', 'plantain'];
                                            const hasSlowItem = order.items?.some((item: any) => {
                                                const name = item.name.toLowerCase();
                                                const category = item.category?.toLowerCase() || '';
                                                return specialNames.some(s => name.includes(s)) || category.includes('special');
                                            });
                                            return hasSlowItem ? '1 Hour' : '30 Minutes';
                                        })()}</strong></span>
                                    </div>
                                )}
                            </div>

                            {order.status === 'cancelled' ? (
                                <div className={styles.cancelledAlert}>
                                    <h3>Order Cancelled</h3>
                                    <p>Our team is currently not available for delivery right now, please try again later.</p>
                                </div>
                            ) : (
                                <div className={styles.progressList}>
                                    {ORDER_STATUSES.map((status, index) => (
                                        <div
                                            key={status.id}
                                            className={`${styles.statusItem} ${getStatusClass(status.id, order.status)}`}
                                        >
                                            <div className={styles.iconWrapper}>
                                                {status.icon}
                                                {index < ORDER_STATUSES.length - 1 && <div className={styles.connector}></div>}
                                            </div>
                                            <div className={styles.statusContent}>
                                                <h4>{status.label}</h4>
                                                <p>{status.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Customer & Items */}
                    <div className={styles.detailsColumn}>
                        <div className={styles.card}>
                            <h3><User size={20} /> Customer Information</h3>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <label>Name</label>
                                    <p>{order.customer.name}</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Phone</label>
                                    <p>{order.customer.phone}</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Address</label>
                                    <p>{order.customer.address}</p>
                                </div>
                                {order.customer.notes && (
                                    <div className={styles.infoItem + ' ' + styles.fullWidth}>
                                        <label>Notes</label>
                                        <p>{order.customer.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h3><Package size={20} /> Order Items</h3>
                            <div className={styles.itemsList}>
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className={styles.itemRow}>
                                        <div className={styles.itemName}>
                                            <span className={styles.itemQty}>{item.quantity}x</span>
                                            <span>{item.name}</span>
                                        </div>
                                        <span className={styles.itemPrice}>₦{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.totalRow}>
                                <span>Total Amount</span>
                                <span className={styles.finalPrice}>₦{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
