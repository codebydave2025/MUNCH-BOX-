'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function TrackingPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedId = localStorage.getItem('lastOrderId');
    if (storedId) {
      setOrderId(storedId);
    }
  }, []);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawId = orderId || localStorage.getItem('lastOrderId');

    if (!rawId) {
      setError('Please enter an Order ID to track.');
      return;
    }

    const idToTrack = rawId.trim().replace(/^#/, '');
    setLoading(true);
    setError('');

    try {
      // Just check if it exists before redirecting
      const response = await fetch(`/api/orders/${idToTrack}`);
      if (response.ok) {
        router.push(`/tracking/${idToTrack}`);
      } else {
        const altResponse = await fetch(`/api/orders/ORD-${idToTrack}`);
        if (altResponse.ok) {
          router.push(`/tracking/ORD-${idToTrack}`);
        } else {
          setError('Order not found. Please check the ID and try again.');
        }
      }
    } catch (err) {
      setError('Error connecting to the tracker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <h1>Introducing <span style={{ color: '#FFD700' }}>New Order Tracking</span></h1>
          <p>Stay updated with our new real-time tracking system! From the kitchen to your doorstep, follow your delicious meal every step of the way.</p>
          <div className={styles.trackingImageWrapper}>
            <img
              src="/Untitled design (3)-Photoroom.png"
              alt="Tracking Delivery"
              className={styles.trackingImage}
            />
          </div>
        </div>

        <div className={styles.trackingSection}>
          <form onSubmit={handleTrackOrder} className={styles.trackForm}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Enter Your Order ID (e.g. #ORD-123)"
                className={styles.orderInput}
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={styles.trackButton}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Track My Order'}
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </form>

        </div>
      </div>
    </main>
  );
}