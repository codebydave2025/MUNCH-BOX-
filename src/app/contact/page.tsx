'use client';

import React, { useState } from 'react';
import {
    Phone,
    Mail,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Send,
    Star,
    CheckCircle,
    MessageCircle,
    Music2
} from 'lucide-react';
import styles from './page.module.css';

export default function ContactPage() {
    const [rating, setRating] = useState(5);
    const [type, setType] = useState('review');
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
            status: 'new',
            date: new Date().toISOString()
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

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className={styles.title}>Get In Touch</h1>
                <p className={styles.subtitle}>
                    Have a question, some feedback, or just want to say hello?
                    Our team is always here to listen and help!
                </p>

                <div className={styles.grid}>
                    {/* Left Column: Contact Info & Socials */}
                    <div className={styles.infoSection}>
                        <div className={`${styles.card} ${styles.infoCard}`}>
                            <h3><MessageCircle size={24} /> Contact Information</h3>
                            <div className={styles.contactMethods}>
                                <div className={styles.method}>
                                    <div className={styles.iconWrapper}>
                                        <MapPin size={22} />
                                    </div>
                                    <div className={styles.methodText}>
                                        <h4>Our Location</h4>
                                        <p>Veritas University, Bwari, Abuja, Nigeria</p>
                                    </div>
                                </div>
                                <div className={styles.method}>
                                    <div className={styles.iconWrapper}>
                                        <Phone size={22} />
                                    </div>
                                    <div className={styles.methodText}>
                                        <h4>Phone Number</h4>
                                        <p>+234 800 MUNCHBOX (+234 800 6862 4269)</p>
                                    </div>
                                </div>
                                <div className={styles.method}>
                                    <div className={styles.iconWrapper}>
                                        <Mail size={22} />
                                    </div>
                                    <div className={styles.methodText}>
                                        <h4>Email Address</h4>
                                        <p>Munchbox.ltd@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.card} ${styles.socialCard}`}>
                            <h3>Connect With Us</h3>
                            <div className={styles.socialGrid}>
                                <a href="https://instagram.com/munchbox_vuna" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                    <Instagram size={28} />
                                    <span>Instagram</span>
                                </a>
                                <a href="https://tiktok.com/@munch__box" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                    <Music2 size={28} />
                                    <span>TikTok</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Feedback Form */}
                    <div className={styles.formCard}>
                        {isSubmitted ? (
                            <div className={styles.successState}>
                                <CheckCircle size={80} className={styles.successIcon} />
                                <h3>Feedback Received!</h3>
                                <p className={styles.formSubtitle}>
                                    Thank you for sharing your thoughts with us.
                                    We value your input and will use it to make MUNCHBOX even better.
                                </p>
                                <button
                                    className={styles.submitBtn}
                                    style={{ width: '100%' }}
                                    onClick={() => setIsSubmitted(false)}
                                >
                                    Send Another Response
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3>We Value Your Review</h3>
                                <p className={styles.formSubtitle}>Rating us helps us improve our service for you.</p>

                                <form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.inputGroup}>
                                        <label>Submission Type</label>
                                        <div className={styles.typeToggle}>
                                            <button
                                                type="button"
                                                className={`${styles.typeBtn} ${type === 'review' ? styles.typeBtnActive : ''}`}
                                                onClick={() => setType('review')}
                                            >
                                                General Review
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.typeBtn} ${type === 'complaint' ? styles.typeBtnActive : ''}`}
                                                onClick={() => setType('complaint')}
                                            >
                                                Report Issue
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Overall Experience</label>
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
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Your Message</label>
                                        <textarea
                                            rows={4}
                                            required
                                            placeholder={type === 'complaint' ? 'Please describe the issue in detail...' : 'Share what you loved about your experience!'}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className={styles.submitBtn}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : (
                                            <>
                                                <Send size={20} />
                                                <span>Submit Feedback</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
