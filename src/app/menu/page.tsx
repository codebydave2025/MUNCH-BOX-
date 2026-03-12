'use client';

import { useState, useEffect } from 'react';
import MenuCard from '../components/MenuCard';
import styles from './page.module.css';
import { RefreshCw, Package, Users, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MenuPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeMealGroup, setActiveMealGroup] = useState<string>('Order 1');
    const { addToCart } = useCart();
    const [orderGroups, setOrderGroups] = useState(['Order 1', 'Order 2', 'Order 3']);

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

    const filteredItems = (activeCategory === 'All'
        ? items
        : items.filter(item => item.category === activeCategory))
        .filter(item => item.category !== 'Packaging');

    const categoriesList = ['All', ...new Set(items.map((i: any) => i.category))];

    if (loading) {
        return (
            <div style={{ padding: '10rem 0', textAlign: 'center' }}>
                <RefreshCw size={40} className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Browsing Menu...</p>
            </div>
        );
    }

    return (
        <main style={{ padding: '2rem 0' }}>
            <div className="container">
                <h1 className={styles.title}>Our Menu</h1>

                <div className={styles.tabs}>
                    {categoriesList.map((category: any) => (
                        <button
                            key={category}
                            className={`${styles.tab} ${activeCategory === category ? styles.activeTab : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>



                <div className={styles.grid}>
                    {filteredItems.map(item => (
                        <MenuCard
                            key={item.id}
                            item={item}
                            mealGroup={activeMealGroup}
                            setMealGroup={setActiveMealGroup}
                            orderGroups={orderGroups}
                            setOrderGroups={setOrderGroups}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}

