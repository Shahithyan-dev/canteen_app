'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import OrderCard from '@/components/OrderCard';
import ManageMenu from '@/components/ManageMenu';
import styles from './canteen.module.css';

const STATUS_FILTERS = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'pending', label: 'Pending', icon: '⏳' },
  { id: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { id: 'ready', label: 'Ready', icon: '✅' },
  { id: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function CanteenDashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, preparing: 0, ready: 0, revenue: 0 });
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && user.role !== 'staff') router.push('/');
  }, [user, loading, router]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders(data.orders);
      computeStats(data.orders);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  function computeStats(list) {
    setStats({
      total: list.length,
      pending: list.filter((o) => o.status === 'pending').length,
      preparing: list.filter((o) => o.status === 'preparing').length,
      ready: list.filter((o) => o.status === 'ready').length,
      revenue: list.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0),
    });
  }

  useEffect(() => {
    if (user?.role === 'staff' && token) fetchOrders();
  }, [user, token, fetchOrders]);

  // Polling for orders every 10 seconds
  useEffect(() => {
    if (!user || user.role !== 'staff' || !token) return;
    
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, token, fetchOrders]);


  const handleStatusChange = async (orderId, status) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders((prev) => {
        const updated = prev.map((o) => o._id === orderId ? { ...o, status } : o);
        computeStats(updated);
        return updated;
      });
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  if (loading || !user) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user.role !== 'staff') return null;

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="page-enter">
      <main className={styles.main}>
        <div className="container">
          {/* New order alert */}
          {newOrderAlert && (
            <div className={styles.newOrderBanner}>
              <span className={styles.newOrderPing} />
              🔔 New Order Received! <strong className="badge badge-order-id">{newOrderAlert}</strong>
            </div>
          )}

          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Canteen Dashboard 👨‍🍳</h1>
              <p className={styles.subtitle}>Manage your orders and menu from here</p>
            </div>
            {activeTab === 'orders' && (
              <button className="btn btn-outline btn-sm" onClick={fetchOrders} id="refresh-dashboard">↻ Refresh</button>
            )}
          </div>

          {/* Main Tabs */}
          <div className={styles.mainTabs}>
            <button 
              className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('orders')}
            >
              📋 Live Orders
            </button>
            <button 
              className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('menu')}
            >
              🍽️ Manage Menu
            </button>
          </div>

          {activeTab === 'orders' ? (
            <>
              {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.statTotal}`}>
              <span className={styles.statIcon}>📋</span>
              <span className={styles.statNum}>{stats.total}</span>
              <span className={styles.statLabel}>Total Today</span>
            </div>
            <div className={`${styles.statCard} ${styles.statPending}`}>
              <span className={styles.statIcon}>⏳</span>
              <span className={styles.statNum}>{stats.pending}</span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            <div className={`${styles.statCard} ${styles.statPreparing}`}>
              <span className={styles.statIcon}>🔥</span>
              <span className={styles.statNum}>{stats.preparing}</span>
              <span className={styles.statLabel}>Preparing</span>
            </div>
            <div className={`${styles.statCard} ${styles.statReady}`}>
              <span className={styles.statIcon}>✅</span>
              <span className={styles.statNum}>{stats.ready}</span>
              <span className={styles.statLabel}>Ready</span>
            </div>
            <div className={`${styles.statCard} ${styles.statRevenue}`}>
              <span className={styles.statIcon}>💰</span>
              <span className={styles.statNum}>₹{stats.revenue}</span>
              <span className={styles.statLabel}>Revenue</span>
            </div>
          </div>

          {/* Filter tabs */}
          <div className={styles.filterTabs}>
            {STATUS_FILTERS.map((f) => {
              const count = f.id === 'all' ? orders.length : orders.filter((o) => o.status === f.id).length;
              return (
                <button
                  key={f.id}
                  className={`${styles.filterTab} ${filter === f.id ? styles.filterTabActive : ''}`}
                  onClick={() => setFilter(f.id)}
                  id={`filter-${f.id}`}
                >
                  {f.icon} {f.label} {count > 0 && <span className={styles.filterCount}>{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Orders */}
          {ordersLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍱</div>
              <h3>No orders {filter !== 'all' ? `with status "${filter}"` : 'yet'}</h3>
              <p>Orders will appear here in real-time as students place them</p>
            </div>
          ) : (
            <div className={styles.orderGrid}>
              {filtered.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  isStaff={true}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
            </>
          ) : (
            <ManageMenu />
          )}
        </div>
      </main>
    </div>
  );
}
