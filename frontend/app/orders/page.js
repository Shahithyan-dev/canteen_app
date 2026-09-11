'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import OrderCard from '@/components/OrderCard';
import styles from './orders.module.css';

function OrdersContent() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const newOrderId = searchParams.get('new');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.role === 'staff') router.push('/canteen');
  }, [user, loading, router]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders(data.orders);
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) fetchOrders();
  }, [user, token, fetchOrders]);

  // Polling for order status updates every 10 seconds
  useEffect(() => {
    if (!user || !token) return;
    const interval = setInterval(() => fetchOrders(), 10000);
    return () => clearInterval(interval);
  }, [user, token, fetchOrders]);


  if (loading || !user) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="page-enter">

      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>My Orders 📋</h1>
            <button className="btn btn-outline btn-sm" onClick={fetchOrders} id="refresh-orders">↻ Refresh</button>
          </div>

          {/* New order success banner */}
          {newOrderId && (
            <div className={`alert alert-success ${styles.successBanner}`}>
              <span>🎉</span>
              <div>
                <strong>Order placed successfully!</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  Your order <code className="badge badge-order-id">{newOrderId}</code> has been sent to the canteen.
                </div>
              </div>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {ordersLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="spinner" />
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No orders yet</h3>
              <p>Place your first order from the menu!</p>
              <button className="btn btn-primary" onClick={() => router.push('/')}>Browse Menu</button>
            </div>
          ) : (
            <>
              {/* Active Orders */}
              {activeOrders.length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.liveIndicator} />
                    Active Orders ({activeOrders.length})
                  </h2>
                  <div className={styles.ordersList}>
                    {activeOrders.map((order) => (
                      <OrderCard key={order._id} order={order} isStaff={false} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Orders */}
              {pastOrders.length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Past Orders ({pastOrders.length})</h2>
                  <div className={styles.ordersList}>
                    {pastOrders.map((order) => (
                      <OrderCard key={order._id} order={order} isStaff={false} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>}>
      <OrdersContent />
    </Suspense>
  );
}
