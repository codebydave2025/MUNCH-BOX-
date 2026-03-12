import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Star, Package, Users, ChevronDown, Plus } from 'lucide-react';
import { MenuItem } from '../data/menu';
import styles from './MenuCard.module.css';
import { useCart } from '../context/CartContext';

interface MenuCardProps {
    item: MenuItem;
    mealGroup?: string;
    setMealGroup?: (val: string) => void;
    orderGroups?: string[];
    setOrderGroups?: (val: string[]) => void;
}

export default function MenuCard({ item, mealGroup, setMealGroup, orderGroups, setOrderGroups }: MenuCardProps) {
    const { addToCart, toggleFavorite, isFavorite } = useCart();
    const [showOptions, setShowOptions] = useState(false);
    const [packagingChoice, setPackagingChoice] = useState<'small' | 'big' | 'pickup' | null>(null);
    const favoritestatus = isFavorite(item.id);

    // Default rating if not provided
    const rating = item.rating || 5;

    const handleConfirmOrder = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.available === false || !packagingChoice) return;

        // Add the food item
        addToCart(item, mealGroup);

        // Add the packaging if selected
        if (packagingChoice === 'small') {
            addToCart({
                id: 'takeaway-small',
                name: 'Takeaway (Small)',
                price: 200,
                image: '/hero-food.png',
                category: 'Packaging'
            }, mealGroup);
        } else if (packagingChoice === 'big') {
            addToCart({
                id: 'takeaway-big',
                name: 'Takeaway (Big)',
                price: 300,
                image: '/hero-food.png',
                category: 'Packaging'
            }, mealGroup);
        }

        setShowOptions(false);
        setPackagingChoice(null); // Reset for next time
    };

    const addNewPerson = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (orderGroups && setOrderGroups && setMealGroup) {
            const nextGroup = `Order ${orderGroups.length + 1}`;
            setOrderGroups([...orderGroups, nextGroup]);
            setMealGroup(nextGroup);
        }
    };

    return (
        <div
            className={`${styles.card} ${item.available === false ? styles.unavailable : ''} ${showOptions ? styles.cardExpanded : ''}`}
            onClick={() => item.available !== false && setShowOptions(!showOptions)}
        >
            <div className={styles.imageContainer}>
                {item.isNew && item.available !== false && <span className={styles.newBadge}>NEW</span>}
                {item.available === false && <span className={styles.soldOutBadge}>SOLD OUT</span>}
                <button
                    className={styles.wishlistBtn}
                    aria-label="Add to wishlist"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item);
                    }}
                >
                    <Heart size={16} fill={favoritestatus ? "#D32F2F" : "white"} color={favoritestatus ? "#D32F2F" : "white"} />
                </button>
                {item.available === false && (
                    <div className={styles.soldOutContainer}>
                        <span className={styles.soldOutText}>Sold Out</span>
                    </div>
                )}
                <Image
                    src={item.image}
                    alt={item.name}
                    width={300}
                    height={200}
                    className={styles.productImage}
                    unoptimized
                />
            </div>

            <div className={styles.content}>
                <div className={styles.topRow}>
                    <h3 className={styles.title}>{item.name}</h3>
                    <div className={styles.priceContainer}>
                        <span className={styles.price}>₦{item.price.toLocaleString()}</span>
                    </div>
                </div>

                <div className={styles.bottomRow}>
                    <div className={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                fill={i < rating ? "#FF7A00" : "none"}
                                color="#FF7A00"
                            />
                        ))}
                    </div>
                    <button
                        className={styles.orderBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (item.available !== false) setShowOptions(!showOptions);
                        }}
                        disabled={item.available === false}
                    >
                        {item.available === false ? 'Out of Stock' : (showOptions ? 'Close' : 'Select Options')}
                    </button>
                </div>

                {showOptions && item.available !== false && (
                    <div className={styles.optionsDropdown} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.optionsSection}>
                            <h4 className={styles.optionsTitle}><Package size={14} /> Packaging (Compulsory)</h4>
                            <div className={styles.packagingButtons}>
                                <button
                                    className={`${styles.miniBtn} ${packagingChoice === 'small' ? styles.btnActive : ''}`}
                                    onClick={() => setPackagingChoice('small')}
                                >
                                    Takeaway (Small)
                                </button>
                                <button
                                    className={`${styles.miniBtn} ${packagingChoice === 'big' ? styles.btnActive : ''}`}
                                    onClick={() => setPackagingChoice('big')}
                                >
                                    Takeaway (Big)
                                </button>
                                <button
                                    className={`${styles.miniBtn} ${packagingChoice === 'pickup' ? styles.btnActive : ''} ${styles.fullWidth}`}
                                    onClick={() => setPackagingChoice('pickup')}
                                >
                                    Pickup (No Packaging)
                                </button>
                            </div>
                        </div>

                        {orderGroups && (
                            <div className={styles.optionsSection}>
                                <h4 className={styles.optionsTitle}><Users size={14} /> Ordering for:</h4>
                                <div className={styles.groupGrid}>
                                    {orderGroups.map(group => (
                                        <button
                                            key={group}
                                            className={`${styles.groupOption} ${mealGroup === group ? styles.groupActive : ''}`}
                                            onClick={() => setMealGroup?.(group)}
                                        >
                                            {group}
                                        </button>
                                    ))}
                                    <button className={styles.addBtn} onClick={addNewPerson}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            className={styles.confirmAddBtn}
                            onClick={handleConfirmOrder}
                            disabled={!packagingChoice}
                            style={{ opacity: packagingChoice ? 1 : 0.5 }}
                        >
                            {!packagingChoice ? 'Select Packaging' : `Add to ${mealGroup || 'Order'}`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
