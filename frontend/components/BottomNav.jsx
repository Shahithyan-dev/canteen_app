'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const isStaff = user.role === 'staff';

  return (
    <>

      {/* Bottom Navigation Bar */}
      <nav className={styles.bottomNav}>
        {!isStaff ? (
          <>
            <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`} id="nav-menu">
              <span className={styles.navIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill={pathname==='/'?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </span>
              <span className={styles.navLabel}>Menu</span>
            </Link>

            <Link href="/cart" className={`${styles.navItem} ${pathname === '/cart' ? styles.active : ''}`} id="bottom-nav-cart">
              <span className={styles.navIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {totalItems > 0 && <span className={styles.cartBadge}>{totalItems > 9 ? '9+' : totalItems}</span>}
              </span>
              <span className={styles.navLabel}>Cart</span>
            </Link>

            <Link href="/orders" className={`${styles.navItem} ${pathname === '/orders' ? styles.active : ''}`} id="nav-orders">
              <span className={styles.navIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </span>
              <span className={styles.navLabel}>Orders</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/canteen" className={`${styles.navItem} ${pathname === '/canteen' ? styles.active : ''}`} id="nav-dashboard">
              <span className={styles.navIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
                  <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
                </svg>
              </span>
              <span className={styles.navLabel}>Dashboard</span>
            </Link>
          </>
        )}
      </nav>

      {/* Bottom spacer so content isn't hidden behind bottom nav */}
      <div className={styles.bottomSpacer} />
    </>
  );
}
