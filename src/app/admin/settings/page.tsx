'use client';

import React, { useState, useEffect } from 'react';
import {
    Store,
    User,
    Save,
    ChevronRight,
    Camera,
    RefreshCw
} from 'lucide-react';
import styles from './settings.module.css';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('Store');
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            alert('Settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '5rem', textAlign: 'center' }}><RefreshCw className={styles.spinner} /></div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h3>Settings</h3>
                    <p>Manage your account and store</p>
                </div>
                <nav className={styles.sidebarNav}>
                    {[
                        { id: 'Store', icon: Store, label: 'Store Profile' },
                        { id: 'Account', icon: User, label: 'Account Info' },
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                                <ChevronRight size={14} className={styles.chevron} />
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className={styles.content}>
                {activeTab === 'Store' && (
                    <div className={styles.settingsCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.headerInfo}>
                                <h3>Store Profile</h3>
                                <p>Public information about your store</p>
                            </div>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? <RefreshCw className={styles.spinner} size={18} /> : <Save size={18} />}
                                <span>Save Changes</span>
                            </button>
                        </div>

                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Store Name</label>
                                    <input
                                        type="text"
                                        value={settings.storeName}
                                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Business Email</label>
                                    <input
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        value={settings.phone}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Currency</label>
                                    <select
                                        value={settings.currency}
                                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                    >
                                        <option>Nigerian Naira (₦)</option>
                                        <option>US Dollar ($)</option>
                                    </select>
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Store Address</label>
                                    <textarea
                                        rows={2}
                                        value={settings.address}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Delivery Fee (₦)</label>
                                    <input
                                        type="number"
                                        value={settings.deliveryFee}
                                        onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h4>Operating Hours</h4>
                            <div className={styles.hoursGrid}>
                                {Object.keys(settings.hours).map(day => (
                                    <div key={day} className={styles.hourRow}>
                                        <span className={styles.dayName}>{day}</span>
                                        <div className={styles.timeInputs}>
                                            <input
                                                type="time"
                                                value={settings.hours[day].open}
                                                onChange={(e) => {
                                                    const newHours = { ...settings.hours };
                                                    newHours[day].open = e.target.value;
                                                    setSettings({ ...settings, hours: newHours });
                                                }}
                                            />
                                            <span>to</span>
                                            <input
                                                type="time"
                                                value={settings.hours[day].close}
                                                onChange={(e) => {
                                                    const newHours = { ...settings.hours };
                                                    newHours[day].close = e.target.value;
                                                    setSettings({ ...settings, hours: newHours });
                                                }}
                                            />
                                        </div>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={settings.hours[day].active}
                                                onChange={(e) => {
                                                    const newHours = { ...settings.hours };
                                                    newHours[day].active = e.target.checked;
                                                    setSettings({ ...settings, hours: newHours });
                                                }}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Account' && (
                    <div className={styles.settingsCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.headerInfo}>
                                <h3>Account Information</h3>
                                <p>Admin user profile</p>
                            </div>
                            <button className={styles.saveBtn} onClick={() => alert('Profile updated!')}>
                                <Save size={18} /> <span>Save Changes</span>
                            </button>
                        </div>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input type="text" defaultValue="Ayodeji Admin" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Role</label>
                                    <input type="text" defaultValue="Owner" disabled />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
