'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Lock, User, Mail, Phone } from 'lucide-react';
import Image from 'next/image';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('user_authenticated');
    const isAdmin = localStorage.getItem('admin_authenticated');

    if (isAuthenticated) {
      router.push('/');
    } else if (isAdmin) {
      router.push('/admin');
    }

    // Load saved email if remember me was used
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          if (rememberMe) {
            localStorage.setItem('remembered_email', email);
          } else {
            localStorage.removeItem('remembered_email');
          }

          if (data.isAdmin) {
            localStorage.setItem('admin_authenticated', 'true');
            localStorage.removeItem('user_authenticated');
          } else {
            localStorage.setItem('user_authenticated', 'true');
            localStorage.removeItem('admin_authenticated');
            localStorage.setItem('current_user', JSON.stringify(data.user));
          }
          router.push(data.isAdmin ? '/admin' : '/');
        } else {
          setError(data.error || 'Invalid credentials. Please try again.');
        }
      } else {
        // Signup logic
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('user_authenticated', 'true');
          localStorage.removeItem('admin_authenticated');
          localStorage.setItem('current_user', JSON.stringify(data.user));
          router.push('/');
        } else {
          setError(data.error || 'Signup failed. Please try again.');
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoSquare}>
            <Image
              src="/logo-white.png"
              alt="MUNCHBOX Logo"
              width={120}
              height={120}
              priority
              unoptimized
            />
          </div>
          <h1 className={styles.logoText}>MUNCHBOX</h1>
          <p className={styles.tagline}>Delicious meals delivered to your door</p>
        </div>

        {/* Form Section */}
        <div className={styles.formSection}>
          <div className={styles.toggleButtons}>
            <button
              className={`${styles.toggleBtn} ${isLogin ? styles.active : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`${styles.toggleBtn} ${!isLogin ? styles.active : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <User className={styles.inputIcon} size={20} />
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className={styles.inputField}
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <Mail className={styles.inputIcon} size={20} />
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.inputField}
              />
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <Phone className={styles.inputIcon} size={20} />
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={!isLogin}
                  className={styles.inputField}
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <Lock className={styles.inputIcon} size={20} />
              <input
                type="password"
                name="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.inputField}
              />
            </div>

            {isLogin && (
              <div className={styles.rememberMeContainer}>
                <label className={styles.rememberMeLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>
            )}

            {!isLogin && (
              <div className={styles.inputGroup}>
                <Lock className={styles.inputIcon} size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                  className={styles.inputField}
                />
              </div>
            )}

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                'Processing...'
              ) : isLogin ? (
                'Login to Munchbox'
              ) : (
                'Create Account'
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}