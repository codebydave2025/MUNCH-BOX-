'use client';

import React from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart, CartItem } from '../context/CartContext';
import styles from './page.module.css';

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, takeawayFee, deliveryFee, isDelivery, setIsDelivery } = useCart();

    // Group items by mealGroup
    const groupedItems = cartItems.reduce((acc: Record<string, CartItem[]>, item) => {
        const group = item.mealGroup || 'Order 1';
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});

    const mealGroups = Object.keys(groupedItems).sort((a, b) => a.localeCompare(b));

    if (cartItems.length === 0) {
        return (
            <main className={styles.emptyCart}>
                <div className="container">
                    <h1>Your Cart is Empty</h1>
                    <p>Looks like you haven't added anything yet.</p>
                    <Link href="/menu" className="btn btn-primary" style={{ marginTop: '2rem' }}>
                        Browse Menu
                    </Link>
                </div>
            </main>
        );
    }

    const finalTotal = cartTotal + takeawayFee + deliveryFee;

    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.headerRow}>
                    <h1 className={styles.title}>Your Cart</h1>
                    <button className={styles.clearBtn} onClick={clearCart}>
                        <Trash2 size={16} /> Clear Cart
                    </button>
                </div>

                <div className={styles.grid}>
                    <div className={styles.items}>
                        {mealGroups.map((groupName) => (
                            <div key={groupName} className={styles.mealGroupSection}>
                                <h2 className={styles.mealGroupName}>{groupName}</h2>
                                {groupedItems[groupName].map((item: CartItem) => (
                                    <div key={`${item.id}-${item.mealGroup}`} className={styles.item}>
                                        <div className={styles.imageWrapper}>
                                            <Image src={item.image} alt={item.name} width={80} height={80} className={styles.image} />
                                        </div>

                                        <div className={styles.details}>
                                            <h3>{item.name}</h3>
                                            <p className={styles.price}>₦{item.price.toLocaleString()}</p>
                                        </div>

                                        <div className={styles.controls}>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.mealGroup)}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className={styles.qty} style={{ color: 'red', fontWeight: 'bold' }}>{item.quantity}</span>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.mealGroup)}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeFromCart(item.id, item.mealGroup)}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className={styles.summary}>
                        <h2>Order Summary</h2>

                        <div className={styles.deliveryToggle}>
                            <label className={styles.toggleLabel}>
                                <input
                                    type="checkbox"
                                    checked={isDelivery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsDelivery(e.target.checked)}
                                />
                                <span>I want Delivery (₦500 fee)</span>
                            </label>
                        </div>

                        <div className={styles.row}>
                            <span>Subtotal</span>
                            <span>₦{cartTotal.toLocaleString()}</span>
                        </div>
                        {takeawayFee > 0 && (
                            <div className={styles.row}>
                                <span>Takeaway Fee</span>
                                <span>₦{takeawayFee.toLocaleString()}</span>
                            </div>
                        )}
                        <div className={styles.row}>
                            <span>Delivery Fee</span>
                            <span>₦{deliveryFee.toLocaleString()}</span>
                        </div>
                        <div className={`${styles.row} ${styles.total}`}>
                            <span>Total</span>
                            <span>₦{finalTotal.toLocaleString()}</span>
                        </div>

                        <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
