'use client';

import { useState, useEffect } from 'react';
import MenuCard from './MenuCard';
import styles from './FeaturedFood.module.css';

export default function FeaturedFood() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch('/api/menu', { cache: 'no-store' });
                const data = await res.json();
                setItems(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const featuredItems = items.filter(item => item.featured).slice(0, 3);

    if (loading || featuredItems.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>Popular <span className={styles.highlight}>Food</span></h2>
                    <p className={styles.subtitle}>
                        We provide the most delicious and popular food.<br />
                        We check & deliver fresh and clean food.
                    </p>
                </div>

                <div className={styles.grid}>
                    {featuredItems.map(item => (
                        <MenuCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
}

