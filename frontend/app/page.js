'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

import MenuCard from '@/components/MenuCard';
import styles from './page.module.css';
import axios from 'axios';

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: '🍴' },
  { id: 'snacks', label: 'Snacks', icon: '🥪' },
  { id: 'meals', label: 'Meals', icon: '🍱' },
  { id: 'drinks', label: 'Drinks', icon: '🥤' },
  { id: 'combos', label: 'Combos', icon: '🎁' },
];

export default function MenuPage() {
  const { user, loading, token } = useAuth();
  const { totalItems, totalPrice } = useCart();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuLoading, setMenuLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.role === 'staff') router.push('/canteen');
  }, [user, loading, router]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setMenuLoading(true);
        const url = activeCategory === 'all' ? '/api/menu' : `/api/menu?category=${activeCategory}`;
        const res = await axios.get(url);
        setMenuItems(res.data.items);
      } catch (err) {
        console.error('Failed to fetch menu', err);
      } finally {
        setMenuLoading(false);
      }
    };
    fetchMenu();
  }, [activeCategory]);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)' }}>Loading CampusEats...</p>
    </div>
  );

  if (!user || user.role === 'staff') return null;

  const filtered = menuItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">

      <main className={styles.main}>
        <div className="container">
          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>🏫 {user.classSection} — {user.department.split(' ')[0]}</div>
              <h1 className={styles.heroTitle}>
                Hey {user.name.split(' ')[0]}, <br />
                <span className="gradient-text">what are you craving?</span>
              </h1>
              <p className={styles.heroSub}>Fresh food from the canteen, ordered straight from your classroom 🍱</p>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <span className={styles.statNum}>{menuItems.length}+</span>
                <span className={styles.statLabel}>Menu Items</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>15</span>
                <span className={styles.statLabel}>Min Avg</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>⭐ 4.7</span>
                <span className={styles.statLabel}>Avg Rating</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={`form-input ${styles.searchInput}`}
              placeholder="Search for samosa, dosa, chai..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="menu-search"
            />
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Category Tabs */}
          <div className={styles.categoryTabs}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.catTab} ${activeCategory === cat.id ? styles.catTabActive : ''}`}
                onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
                id={`cat-${cat.id}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          {menuLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h3>No items found</h3>
              <p>Try a different category or search term</p>
            </div>
          ) : (
            <div className={styles.menuGrid}>
              {filtered.map((item) => <MenuCard key={item._id} item={item} />)}
            </div>
          )}
        </div>
      </main>


    </div>
  );
}
