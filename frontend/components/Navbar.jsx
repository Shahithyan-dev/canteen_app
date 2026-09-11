'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const isStaff = user.role === 'staff';

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navInner}`}>
        {/* Logo */}
        <Link href={isStaff ? '/canteen' : '/'} className={styles.logo}>
          <span className={styles.logoIcon}>🍱</span>
          <span className={styles.logoText}>
            Campus<span className={styles.logoAccent}>Eats</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={styles.navLinks}>
          {!isStaff && (
            <>
              <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>Menu</Link>
              <Link href="/orders" className={`${styles.navLink} ${pathname === '/orders' ? styles.active : ''}`}>My Orders</Link>
            </>
          )}
          {isStaff && (
            <Link href="/canteen" className={`${styles.navLink} ${pathname === '/canteen' ? styles.active : ''}`}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div className={styles.navRight}>
          {!isStaff && (
            <Link href="/cart" className={styles.cartBtn}>
              <span className={styles.cartIcon}>🛒</span>
              {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
            </Link>
          )}

          {/* User Info */}
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{user.name[0].toUpperCase()}</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user.name.split(' ')[0]}</span>
              <span className={styles.userRole}>{isStaff ? '👨‍🍳 Staff' : user.classSection}</span>
            </div>
          </div>

          <button onClick={handleLogout} className={`btn btn-ghost btn-sm ${styles.logoutBtn}`}>
            Logout
          </button>

          {/* Mobile hamburger */}
          <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {!isStaff && (
            <>
              <Link href="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>🍽️ Menu</Link>
              <Link href="/cart" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>🛒 Cart {totalItems > 0 && `(${totalItems})`}</Link>
              <Link href="/orders" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>📋 My Orders</Link>
            </>
          )}
          {isStaff && (
            <Link href="/canteen" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>📊 Dashboard</Link>
          )}
          <button onClick={handleLogout} className={styles.mobileLink} style={{ color: 'var(--danger)', textAlign: 'left', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
}
