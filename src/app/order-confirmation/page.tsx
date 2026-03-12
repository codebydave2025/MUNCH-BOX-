'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock } from 'lucide-react';

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        if (orderId) {
            fetch(`/api/orders/${orderId}`)
                .then(res => res.json())
                .then(data => setOrder(data))
                .catch(err => console.error('Failed to fetch order', err));
        }
    }, [orderId]);

    const getWaitTime = () => {
        if (!order || !order.items) return '30 Minutes';
        const specialNames = ['noodles', 'french fries', 'yam strips', 'plantain'];
        const hasSlowItem = order.items.some((item: any) => {
            const name = item.name.toLowerCase();
            const category = item.category?.toLowerCase() || '';
            return specialNames.some(s => name.includes(s)) || category.includes('special');
        });
        return hasSlowItem ? '1 Hour' : '30 Minutes';
    };

    return (
        <div className="confirmationCard">
            <CheckCircle size={80} color="#ffffff" style={{ marginBottom: '2rem' }} />
            <h1 className="confirmationTitle">Order Confirmed!</h1>
            <p className="confirmationText">
                Thank you for your order. We have received it and will begin processing it immediately.
            </p>

            {orderId && (
                <div className="orderInfoBox">
                    <p className="orderIdText">Order ID: <strong>{orderId}</strong></p>
                    {order && (
                        <div className="etdInfo">
                            <Clock size={20} color="#FFD700" />
                            <div className="etdText">
                                <span className="etdLabel">Estimated Wait Time:</span>
                                <span className="etdValue">{getWaitTime()}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="actionButtons">
                <Link href={`/tracking/${orderId}`} className="btn btn-primary">
                    Track Your Order
                </Link>
                <Link href="/menu" className="btn btn-outline" style={{ marginLeft: '1rem' }}>
                    Order More Food
                </Link>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <main className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Suspense fallback={<div>Loading...</div>}>
                <ConfirmationContent />
            </Suspense>
        </main>
    );
}
