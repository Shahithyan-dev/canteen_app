'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.push(user.role === 'staff' ? '/canteen' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      {/* Background decoration */}
      <div className={styles.bgDeco1} />
      <div className={styles.bgDeco2} />

      <div className={styles.authCard}>
        {/* Logo */}
        <div className={styles.authLogo}>
          <span className={styles.logoEmoji}>🍱</span>
          <h1 className={styles.logoTitle}>Campus<span className={styles.logoAccent}>Eats</span></h1>
          <p className={styles.logoSub}>Order canteen food from your classroom</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>Welcome back 👋</h2>
          <p className={styles.formSub}>Login to place your order</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@college.edu"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="login-btn">
            {loading ? <><span className={styles.btnSpinner}/> Logging in...</> : '→ Login'}
          </button>

          <div className="divider">or</div>

          <p className={styles.switchText}>
            Don't have an account?{' '}
            <Link href="/register" className={styles.switchLink}>Register here</Link>
          </p>

          <div className={styles.staffHint}>
            <span>👨‍🍳 Canteen staff? Use staff code during registration</span>
          </div>
        </form>
      </div>
    </div>
  );
}
