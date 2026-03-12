'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    UserPlus,
    MoreVertical,
    Shield,
    Clock,
    TrendingUp,
    Mail,
    Phone,
    RefreshCw,
    Users,
    X,
    Trash2
} from 'lucide-react';
import styles from './employees.module.css';

interface Employee {
    id: string;
    name: string;
    role: string;
    status: string;
    email: string;
    phone: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: 'Cashier',
        email: '',
        phone: '',
        status: 'Active'
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/employees');
            const data = await res.json();
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (emp: Employee | null = null) => {
        if (emp) {
            setEditingEmp(emp);
            setFormData({
                name: emp.name,
                role: emp.role,
                email: emp.email,
                phone: emp.phone,
                status: emp.status
            });
        } else {
            setEditingEmp(null);
            setFormData({
                name: '',
                role: 'Cashier',
                email: '',
                phone: '',
                status: 'Active'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingEmp ? `/api/employees/${editingEmp.id}` : '/api/employees';
        const method = editingEmp ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchEmployees();
            }
        } catch (error) {
            console.error('Failed to save employee', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this employee?')) return;
        try {
            const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
            if (res.ok) fetchEmployees();
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && employees.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
                <RefreshCw className={styles.spinner} size={40} />
                <p>Loading Staff Records...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header Stats */}
            <div className={styles.headerStats}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}><Users size={20} /></div>
                    <div className={styles.statText}>
                        <span className={styles.statLabel}>Total Staff</span>
                        <h3 className={styles.statValue}>{employees.length}</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ backgroundColor: '#ecfdf5', color: '#059669' }}><Clock size={20} /></div>
                    <div className={styles.statText}>
                        <span className={styles.statLabel}>Currently Active</span>
                        <h3 className={styles.statValue}>{employees.filter(e => e.status === 'Active').length}</h3>
                    </div>
                </div>
            </div>

            <div className={styles.actionBar}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className={styles.addBtn} onClick={() => handleOpenModal()}>
                    <UserPlus size={18} />
                    <span>Add Employee</span>
                </button>
            </div>

            <div className={styles.employeeGrid}>
                {filteredEmployees.map((emp) => (
                    <div key={emp.id} className={styles.employeeCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.statusDot} style={{ backgroundColor: emp.status === 'Active' ? '#10b981' : '#d1d5db' }} />
                            <button className={styles.moreBtn} onClick={() => handleDelete(emp.id)} title="Delete Employee">
                                <Trash2 size={16} color="#ef4444" />
                            </button>
                        </div>

                        <div className={styles.cardBody}>
                            <div className={styles.avatar}>
                                {emp.name.charAt(0)}
                            </div>
                            <h3 className={styles.name}>{emp.name}</h3>
                            <span className={styles.role}>
                                <Shield size={14} /> {emp.role}
                            </span>

                            <div className={styles.contactInfo}>
                                <div className={styles.contactItem}>
                                    <Mail size={14} /> <span>{emp.email}</span>
                                </div>
                                <div className={styles.contactItem}>
                                    <Phone size={14} /> <span>{emp.phone}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.cardFooter}>
                            <button className={styles.editBtn} onClick={() => handleOpenModal(emp)}>Edit Profile</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>{editingEmp ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Role</label>
                                <select
                                    className={styles.input}
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Cashier">Cashier</option>
                                    <option value="Kitchen Staff">Kitchen Staff</option>
                                    <option value="Delivery">Delivery</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Status</label>
                                <select
                                    className={styles.input}
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveBtn}>
                                    {editingEmp ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
