'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import styles from './favorites.module.css';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import MenuCard from '../components/MenuCard';

export default function FavoritesPage() {
    const { favorites, toggleFavorite, addToCart } = useCart();

    if (favorites.length === 0) {
        return (
            <main className={styles.emptyState}>
                <div className="container">
                    <Heart size={80} className={styles.emptyIcon} />
                    <h1>No Favorites Yet</h1>
                    <p>Start exploring our menu and heart your favorite meals!</p>
                    <Link href="/menu" className="btn btn-primary" style={{ marginTop: '2rem' }}>
                        Go to Menu
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className="container">
                <h1 className={styles.title}>Your Favorites</h1>
                <div className={styles.grid}>
                    {favorites.map(item => (
                        <div key={item.id} className={styles.cardWrapper}>
                            <MenuCard item={item} />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
