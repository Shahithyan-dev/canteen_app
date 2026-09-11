'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './BottomNav.module.css';

export default function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;
  const isStaff = user.role === 'staff';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className={styles.topBar}>
      <div className={`container ${styles.topBarInner}`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🍱</span>
          <span className={styles.logoText}>
            Campus<span className={styles.logoAccent}>Eats</span>
          </span>
        </div>
        <div className={styles.userChip}>
          <div className={styles.userAvatar}>{user.name[0].toUpperCase()}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name.split(' ')[0]}</span>
            <span className={styles.userSub}>{isStaff ? '👨‍🍳 Staff' : user.classSection}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
