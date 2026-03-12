'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '../context/CartContext';
import styles from './page.module.css';

export default function CheckoutPage() {
    const {
        cartItems,
        cartTotal,
        clearCart,
        takeawayFee,
        deliveryFee,
        isDelivery,
        setIsDelivery,
        getTakeawayForItems
    } = useCart();
    const router = useRouter();

    // Group items by mealGroup
    const groupedItems = cartItems.reduce((acc: Record<string, CartItem[]>, item) => {
        const group = item.mealGroup || 'Order 1';
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});

    const mealGroups = Object.keys(groupedItems).sort((a, b) => a.localeCompare(b));

    const finalTotal = cartTotal + takeawayFee + (isDelivery ? deliveryFee : 0);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        altPhone: '',
        address: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill form if user is logged in
    React.useEffect(() => {
        const userData = localStorage.getItem('current_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setFormData(prev => ({
                    ...prev,
                    name: user.name || prev.name,
                    phone: user.phone || prev.phone
                }));
            } catch (e) {
                console.error('Failed to parse user data for checkout', e);
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (formData.phone.length !== 11 || formData.altPhone.length !== 11) {
            alert('Both phone numbers must be exactly 11 digits.');
            setIsSubmitting(false);
            return;
        }

        const orderId = 'ORD-' + Math.floor(Math.random() * 100000);
        const order = {
            id: orderId,
            customer: {
                name: formData.name,
                phone: formData.phone,
                altPhone: formData.altPhone,
                address: formData.address,
                notes: formData.notes
            },
            items: cartItems,
            fees: {
                takeaway: takeawayFee,
                delivery: isDelivery ? deliveryFee : 0
            },
            total: finalTotal,
            status: 'pending',
            date: new Date().toISOString()
        };

        // Save order to file system (mock backend)
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(order),
            });

            if (!response.ok) {
                throw new Error('Failed to save order');
            }

            clearCart();

            // Save order ID to localStorage for easy tracking
            if (typeof window !== 'undefined') {
                localStorage.setItem('lastOrderId', orderId);
            }

            router.push(`/order-processing?id=${orderId}`);
        } catch (error: any) {
            console.error('Error saving order:', error);
            alert('Failed to place order: ' + error.message + '. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className="container">
                <h1 className={styles.title}>Checkout</h1>

                <div className={styles.grid}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.methodToggle}>
                            <button
                                type="button"
                                className={`${styles.methodBtn} ${isDelivery ? styles.methodBtnActive : ''}`}
                                onClick={() => setIsDelivery(true)}
                            >
                                Delivery
                            </button>
                            <button
                                type="button"
                                className={`${styles.methodBtn} ${!isDelivery ? styles.methodBtnActive : ''}`}
                                onClick={() => setIsDelivery(false)}
                            >
                                Pickup
                            </button>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>

                        {isDelivery && (
                            <div className={styles.formGroup}>
                                <label>Delivery Address</label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Street address, Apartment, etc."
                                    rows={3}
                                />
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="080..."
                            />
                            {formData.phone && formData.phone.length !== 11 && (
                                <span className={styles.errorText}>Phone number must be exactly 11 digits</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Alternative Phone Number (Compulsory)</label>
                            <input
                                type="tel"
                                required
                                value={formData.altPhone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, altPhone: e.target.value })}
                                placeholder="090..."
                            />
                            {formData.altPhone && formData.altPhone.length !== 11 && (
                                <span className={styles.errorText}>Alternative phone number must be exactly 11 digits</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Order Notes (Optional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any special instructions..."
                                rows={2}
                            />
                        </div>

                        <div className={styles.accountInfo}>
                            <h3>Payment Information</h3>
                            <p>Please make payment to the following account:</p>
                            <div className={styles.accountDetails}>
                                <p><strong>Bank:</strong> Monipoint</p>
                                <p><strong>Account Number:</strong> 5143904742</p>
                                <p><strong>Account Name:</strong> Munchbox Limited</p>
                            </div>
                            <p className={styles.paymentNote}>After payment, please upload your payment proof or notify us for order confirmation.</p>
                        </div>
                        <button type="submit" className={styles.redButton} disabled={isSubmitting} style={{ width: '100%', marginTop: '1rem' }}>
                            {isSubmitting ? 'Processing Order...' : 'Place Order'}
                        </button>
                    </form>

                    <div className={styles.summary}>
                        <h2>Order Summary</h2>
                        <div className={styles.summaryGroups}>
                            {mealGroups.map(groupName => {
                                const items = groupedItems[groupName];
                                const groupSubtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                                const groupTakeaway = getTakeawayForItems(items);

                                return (
                                    <div key={groupName} className={styles.summaryGroupSection}>
                                        <h3 className={styles.groupHeader}>{groupName}</h3>
                                        <div className={styles.itemsList}>
                                            {items.map((item: CartItem) => (
                                                <div key={`${item.id}-${item.mealGroup}`} className={styles.summaryItem}>
                                                    <span>{item.quantity}x {item.name}</span>
                                                    <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className={styles.groupBreakdown}>
                                            <div className={styles.breakdownRow}>
                                                <span>Subtotal</span>
                                                <span>₦{groupSubtotal.toLocaleString()}</span>
                                            </div>
                                            {groupTakeaway > 0 && (
                                                <div className={styles.breakdownRow}>
                                                    <span>Takeaway Packaging</span>
                                                    <span>₦{groupTakeaway.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className={styles.groupTotal}>
                                                <span>Group Total</span>
                                                <span>₦{(groupSubtotal + groupTakeaway).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.finalTotals}>
                            <div className={styles.summaryRow}>
                                <span>Items Subtotal</span>
                                <span>₦{cartTotal.toLocaleString()}</span>
                            </div>
                            {takeawayFee > 0 && (
                                <div className={styles.summaryRow}>
                                    <span>Total Takeaway Fee</span>
                                    <span>₦{takeawayFee.toLocaleString()}</span>
                                </div>
                            )}
                            {isDelivery && (
                                <div className={styles.summaryRow}>
                                    <span>Delivery Fee</span>
                                    <span>₦{deliveryFee.toLocaleString()}</span>
                                </div>
                            )}
                            <div className={styles.totalRow}>
                                <span>Grand Total</span>
                                <span>₦{finalTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
