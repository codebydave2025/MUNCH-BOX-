'use client';

import React, { useState } from 'react';
import { Star, Send, CheckCircle, MessageSquare } from 'lucide-react';
import styles from './page.module.css';

export default function FeedbackPage() {
    const [rating, setRating] = useState(5);
    const [type, setType] = useState('review'); // review or complaint
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const feedback = {
            name,
            email,
            rating,
            type,
            message,
            status: 'new'
        };

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedback)
            });

            if (res.ok) {
                setIsSubmitted(true);
            }
        } catch (error) {
            console.error('Failed to submit feedback', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.successCard}>
                        <CheckCircle size={80} className={styles.successIcon} />
                        <h2 className={styles.successTitle}>Thank You!</h2>
                        <p className={styles.successText}>
                            Your {type === 'complaint' ? 'feedback' : 'review'} has been received.
                            We appreciate your time and will use your input to improve our service.
                        </p>
                        <button
                            className={styles.submitBtn}
                            onClick={() => window.location.href = '/menu'}
                        >
                            Back to Menu
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className={styles.title}>Customer Feedback</h1>
                <p className={styles.subtitle}>We'd love to hear from you. Tell us about your experience!</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>What would you like to share?</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                className={`${styles.mealBtn} ${type === 'review' ? styles.mealBtnActive : ''}`}
                                onClick={() => setType('review')}
                                style={{ flex: 1 }}
                            >
                                Nice Review
                            </button>
                            <button
                                type="button"
                                className={`${styles.mealBtn} ${type === 'complaint' ? styles.mealBtnActive : ''}`}
                                onClick={() => setType('complaint')}
                                style={{ flex: 1 }}
                            >
                                Complaint
                            </button>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Overall Rating</label>
                        <div className={styles.ratingGroup}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className={styles.starBtn}
                                    onClick={() => setRating(s)}
                                >
                                    <Star
                                        size={32}
                                        fill={s <= rating ? "#FF7A00" : "none"}
                                        color="#FF7A00"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="How should we address you?"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Message</label>
                        <textarea
                            rows={5}
                            required
                            placeholder={type === 'complaint' ? 'Tell us what went wrong...' : 'We love hearing good things!'}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Send size={20} />
                                <span>Submit Feedback</span>
                            </div>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}
