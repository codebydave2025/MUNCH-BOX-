'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem } from '../data/menu';

export interface CartItem extends MenuItem {
    quantity: number;
    mealGroup?: string; // e.g., 'Meal 1', 'Meal 2' (for organizing orders for friends)
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: MenuItem, mealGroup?: string) => void;
    removeFromCart: (itemId: string, mealGroup?: string) => void;
    updateQuantity: (itemId: string, quantity: number, mealGroup?: string) => void;
    clearCart: () => void;
    cartTotal: number;
    takeawayFee: number;
    deliveryFee: number;
    isDelivery: boolean;
    setIsDelivery: (val: boolean) => void;
    cartCount: number;
    favorites: MenuItem[];
    toggleFavorite: (item: MenuItem) => void;
    isFavorite: (itemId: string) => boolean;
    getTakeawayForItems: (items: CartItem[]) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [favorites, setFavorites] = useState<MenuItem[]>([]);
    const [isDelivery, setIsDelivery] = useState(true);

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('munchbox_cart');
        const savedFavorites = localStorage.getItem('munchbox_favorites');

        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }

        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (e) {
                console.error('Failed to parse favorites', e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('munchbox_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('munchbox_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addToCart = (item: MenuItem, mealGroup?: string) => {
        setCartItems((prev: CartItem[]) => {
            const existing = prev.find((i: CartItem) => i.id === item.id && i.mealGroup === mealGroup);
            if (existing) {
                return prev.map((i: CartItem) => (i.id === item.id && i.mealGroup === mealGroup) ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1, mealGroup }];
        });
    };

    const toggleFavorite = (item: MenuItem) => {
        setFavorites(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) {
                return prev.filter(i => i.id !== item.id);
            }
            return [...prev, item];
        });
    };

    const isFavorite = (itemId: string) => {
        return favorites.some(i => i.id === itemId);
    };

    const removeFromCart = (itemId: string, mealGroup?: string) => {
        setCartItems((prev: CartItem[]) => prev.filter((i: CartItem) => !(i.id === itemId && i.mealGroup === mealGroup)));
    };

    const updateQuantity = (itemId: string, quantity: number, mealGroup?: string) => {
        if (quantity < 1) {
            removeFromCart(itemId, mealGroup);
            return;
        }
        setCartItems((prev: CartItem[]) => prev.map((i: CartItem) => (i.id === itemId && i.mealGroup === mealGroup) ? { ...i, quantity } : i));
    };

    const clearCart = () => setCartItems([]);

    const getTakeawayForItems = (items: CartItem[]) => {
        if (items.length === 0) return 0;

        let riceScoops = 0;
        let otherPortions = 0;
        let basmatiFee = 0;

        items.forEach((item: CartItem) => {
            const name = item.name.toLowerCase();
            if (name.includes('rice') && (name.includes('jollof') || name.includes('fried') || name.includes('steamed'))) {
                riceScoops += item.quantity;
            } else if (name.includes('pasta') || name.includes('noodles') || name.includes('yam strips') || name.includes('french fries') || name.includes('plantain')) {
                otherPortions += item.quantity;
            } else if (name.includes('basmati')) {
                if (name.includes('mini')) basmatiFee = Math.max(basmatiFee, 200);
                if (name.includes('maxi')) basmatiFee = Math.max(basmatiFee, 300);
            }
        });

        let riceFee = riceScoops > 0 ? (riceScoops >= 3 ? 300 : 200) : 0;
        let otherFee = otherPortions > 0 ? (otherPortions >= 2 ? 300 : 200) : 0;

        return Math.max(riceFee, otherFee, basmatiFee);
    };

    const takeawayFee = (() => {
        const groups = Array.from(new Set(cartItems.map(i => i.mealGroup || 'Order 1')));
        return groups.reduce((total, group) => {
            const groupItems = cartItems.filter(i => (i.mealGroup || 'Order 1') === group);
            return total + getTakeawayForItems(groupItems);
        }, 0);
    })();

    const deliveryFee = isDelivery ? 500 : 0;

    const cartTotal = cartItems.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count: number, item: CartItem) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            takeawayFee,
            deliveryFee,
            isDelivery,
            setIsDelivery,
            cartCount,
            favorites,
            toggleFavorite,
            isFavorite,
            getTakeawayForItems
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
