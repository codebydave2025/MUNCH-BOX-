'use client';

import React, { useState, useEffect } from 'react';
import {
    Star,
    MessageSquare,
    Trash2,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Filter
} from 'lucide-react';
import styles from './reviews.module.css';

interface Review {
    id: string;
    name: string;
    email: string;
    rating: number;
    type: 'review' | 'complaint';
    message: string;
    date: string;
    status: 'new' | 'resolved';
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'review' | 'complaint'>('all');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/reviews');
            const data = await res.json();
            setReviews(data);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return;
        // In a real app, DELETE /api/reviews/[id]
        setReviews(reviews.filter(r => r.id !== id));
    };

    const handleResolve = (id: string) => {
        setReviews(reviews.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    };

    const filteredReviews = reviews.filter(r =>
        filter === 'all' || r.type === filter
    );

    if (loading) {
        return (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
                <RefreshCw className={styles.spinner} size={40} color="#D92323" />
                <p>Loading Feedback...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className={styles.title}>Customer Reviews & Complaints</h1>
                <button className={styles.btn} style={{ background: '#D92323', color: 'white' }} onClick={fetchReviews}>
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className={styles.topGrid}>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Total Feedback</span>
                    <h3 className={styles.kpiValue}>{reviews.length}</h3>
                </div>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Avg. Rating</span>
                    <h3 className={styles.kpiValue}>
                        {(reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)).toFixed(1)} / 5.0
                    </h3>
                </div>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Complaints</span>
                    <h3 className={styles.kpiValue} style={{ color: '#ef4444' }}>
                        {reviews.filter(r => r.type === 'complaint').length}
                    </h3>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {['all', 'review', 'complaint'].map((f) => (
                    <button
                        key={f}
                        className={styles.btn}
                        style={{
                            background: filter === f ? '#D92323' : 'white',
                            color: filter === f ? 'white' : '#666',
                            border: '1px solid #e0e0e0',
                            textTransform: 'capitalize'
                        }}
                        onClick={() => setFilter(f as any)}
                    >
                        {f}s
                    </button>
                ))}
            </div>

            <div className={styles.reviewGrid}>
                {filteredReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '3rem' }}>
                        <MessageSquare size={48} color="#ccc" />
                        <h3 style={{ marginTop: '1rem', color: '#666' }}>No feedback found</h3>
                    </div>
                ) : (
                    filteredReviews.map((item) => (
                        <div key={item.id} className={styles.reviewCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>{item.name.charAt(0)}</div>
                                    <div className={styles.nameGroup}>
                                        <span className={styles.userName}>{item.name}</span>
                                        <span className={styles.userEmail}>{item.email}</span>
                                    </div>
                                </div>
                                <span className={`${styles.typeBadge} ${item.type === 'review' ? styles.review : styles.complaint}`}>
                                    {item.type}
                                </span>
                            </div>

                            <div className={styles.stars}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        size={14}
                                        fill={s <= item.rating ? "#FF7A00" : "none"}
                                        color="#FF7A00"
                                    />
                                ))}
                            </div>

                            <p className={styles.message}>"{item.message}"</p>

                            <div className={styles.footer}>
                                <span className={styles.date}>{new Date(item.date).toLocaleDateString()}</span>
                                <div className={styles.actions}>
                                    {item.type === 'complaint' && item.status !== 'resolved' && (
                                        <button className={`${styles.btn} ${styles.resolveBtn}`} onClick={() => handleResolve(item.id)}>
                                            Mark Resolved
                                        </button>
                                    )}
                                    {item.status === 'resolved' && (
                                        <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <CheckCircle size={14} /> Resolved
                                        </span>
                                    )}
                                    <button className={`${styles.btn} ${styles.deleteBtn}`} onClick={() => handleDelete(item.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
