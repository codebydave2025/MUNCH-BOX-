'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    Edit2,
    Trash2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    RefreshCw,
    X
} from 'lucide-react';
import styles from './items.module.css';
import { useSearchParams } from 'next/navigation';

interface MenuItem {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    featured?: boolean;
    rating?: number;
    isNew?: boolean;
    available?: boolean;
}

export default function ItemsPage() {
    const searchParams = useSearchParams();
    const globalSearch = searchParams.get('search');
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(globalSearch || '');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Mains',
        image: '/hero-food.png',
        available: true,
        featured: false,
        isNew: true
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/menu');
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch items', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item: MenuItem | null = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                price: item.price.toString(),
                category: item.category,
                image: item.image,
                available: item.available !== undefined ? item.available : true,
                featured: item.featured || false,
                isNew: item.isNew || false
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                price: '',
                category: 'Mains',
                image: '/hero-food.png',
                available: true,
                featured: false,
                isNew: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
        const method = editingItem ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price)
                })
            });

            if (res.ok) {
                // Invalidate cache for current user session
                sessionStorage.removeItem('munchbox_menu_cache');
                setIsModalOpen(false);
                fetchItems();
            }
        } catch (error) {
            console.error('Failed to save item', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
            if (res.ok) {
                // Invalidate cache for current user session
                sessionStorage.removeItem('munchbox_menu_cache');
                fetchItems();
            }
        } catch (error) {
            console.error('Failed to delete item', error);
        }
    };

    const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/menu/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ available: !currentStatus })
            });

            if (res.ok) {
                // Invalidate cache for current user session
                sessionStorage.removeItem('munchbox_menu_cache');
                setItems(prev => prev.map(item =>
                    item.id === id ? { ...item, available: !currentStatus } : item
                ));
            }
        } catch (error) {
            console.error('Failed to toggle availability', error);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categoriesList = ['All', ...new Set(items.map(item => item.category))];

    if (loading && items.length === 0) {
        return (
            <div className={styles.loadingOverlay}>
                <RefreshCw className={styles.spinner} size={40} />
                <p>Loading items...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Search and Filters */}
            <div className={styles.actionBar}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search items..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className={styles.clearBtn}
                            onClick={() => setSearchTerm('')}
                            style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', marginRight: '10px' }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <Filter size={16} />
                        <select
                            className={styles.select}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categoriesList.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <button className={styles.addBtn} onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        <span>Add Item</span>
                    </button>
                </div>
            </div>

            {/* Items Table */}
            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Item Details</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.thumbnail}>
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            <div className={styles.itemText}>
                                                <span className={styles.itemName}>{item.name}</span>
                                                <span className={styles.itemId}>#{item.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={styles.categoryBadge}>{item.category}</span></td>
                                    <td><span className={styles.price}>₦{item.price.toLocaleString()}</span></td>
                                    <td>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                className={styles.switchInput}
                                                checked={item.available !== false}
                                                onChange={() => handleToggleAvailability(item.id, item.available !== false)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                        <span className={`${styles.statusBadge} ${item.available !== false ? styles.active : styles.unavailable}`} style={{ marginLeft: '10px' }}>
                                            {item.available !== false ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={styles.actionBtn} onClick={() => handleOpenModal(item)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className={styles.actionBtn} onClick={() => handleDelete(item.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className={styles.formGroup}>
                                <label>Item Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label>Price (₦)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <select
                                    className={styles.input}
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Mains">Mains</option>
                                    <option value="Protein & Sauces">Protein & Sauces</option>
                                    <option value="Special Sauces">Special Sauces</option>
                                    <option value="Sides">Sides</option>
                                    <option value="Fries">Fries</option>
                                    <option value="Pizza">Pizza</option>
                                    <option value="Specials">Specials</option>
                                </select>
                            </div>
                            <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <label style={{ marginBottom: 0 }}>Available</label>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            className={styles.switchInput}
                                            checked={formData.available}
                                            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <label style={{ marginBottom: 0 }}>Featured</label>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            className={styles.switchInput}
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <label style={{ marginBottom: 0 }}>New Tag</label>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            className={styles.switchInput}
                                            checked={formData.isNew}
                                            onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Image URL</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveBtn}>
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
