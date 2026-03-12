'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

function OrderProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (!orderId) {
      router.push('/menu');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Check for order confirmation every 5 seconds
    const confirmationCheck = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (data.status === 'confirmed') {
          clearInterval(confirmationCheck);
          clearInterval(timer);
          router.push(`/order-confirmation?id=${orderId}`);
        }
      } catch (error) {
        console.log('Checking order status...');
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(confirmationCheck);
    };
  }, [orderId, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!orderId) {
    return null;
  }

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.imageWrapper}>
        <img
          src="/Untitled design (3)-Photoroom.png"
          alt="Processing Order"
          className={styles.processingImage}
        />
      </div>

      <div className={styles.processingCard}>
        <div className={styles.spinner}></div>
        <h1 className={styles.title}>Order Processing</h1>
        <p className={styles.subtitle}>Your order is being reviewed by our admin team. Please hold on while we confirm your payment.</p>

        <div className={styles.orderInfo}>
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Estimated Wait Time:</strong> {formatTime(timeLeft)}</p>
        </div>

        <div className={styles.instructions}>
          <h3>What happens next:</h3>
          <ul>
            <li>Our admin team will review your payment details</li>
            <li>You will receive a confirmation when approved</li>
            <li>Your order will be sent to the kitchen immediately</li>
          </ul>
        </div>

        <div className={styles.status}>
          <div className={styles.statusIndicator}>
            <div className={styles.dot}></div>
            <span>Waiting for admin confirmation...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderProcessingPage() {
  return (
    <main className={styles.main}>
      <div className="container">
        <Suspense fallback={<div>Loading...</div>}>
          <OrderProcessingContent />
        </Suspense>
      </div>
    </main>
  );
}