'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

import CartItem from '@/components/CartItem';
import styles from './cart.module.css';

export default function CartPage() {
  const { user, token } = useAuth();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        items: items.map((i) => ({ itemId: i._id, name: i.name, price: i.price, qty: i.qty })),
        totalAmount: totalPrice,
        specialInstructions: instructions,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');
      clearCart();
      router.push(`/orders?new=${data.order.orderId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">

      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <button className={`btn btn-ghost btn-sm`} onClick={() => router.push('/')} id="back-to-menu">← Menu</button>
            <h1 className={styles.title}>Your Cart 🛒</h1>
            {items.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ color: 'var(--danger)' }}>Clear All</button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add some delicious items from the menu to get started</p>
              <button className="btn btn-primary" onClick={() => router.push('/')}>Browse Menu</button>
            </div>
          ) : (
            <div className={styles.cartLayout}>
              {/* Items */}
              <div className={styles.itemsList}>
                <h2 className={styles.sectionTitle}>Items ({totalItems})</h2>
                {items.map((item) => <CartItem key={item._id} item={item} />)}

                {/* Special Instructions */}
                <div className={styles.instructionsWrap}>
                  <label className="form-label" htmlFor="instructions">
                    Special Instructions <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    id="instructions"
                    className="form-input"
                    rows={3}
                    placeholder="E.g. No onion, extra chutney, less spicy..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className={styles.summaryCard}>
                <h2 className={styles.sectionTitle}>Order Summary</h2>

                <div className={styles.studentCard}>
                  <div className={styles.studentAvatar}>{user.name[0]}</div>
                  <div>
                    <div className={styles.studentName}>{user.name}</div>
                    <div className={styles.studentMeta}>{user.rollNo} • {user.classSection}</div>
                    <div className={styles.studentMeta}>{user.department.split(' ').slice(0,2).join(' ')}</div>
                  </div>
                </div>

                <div className={styles.priceBreakdown}>
                  {items.map((item) => (
                    <div key={item._id} className={styles.priceRow}>
                      <span className={styles.priceItemName}>{item.name} × {item.qty}</span>
                      <span>₹{(item.price * item.qty).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className={styles.priceDivider} />
                  <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                    <span>Total</span>
                    <span className={styles.totalValue}>₹{totalPrice}</span>
                  </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <button
                  className="btn btn-accent btn-full btn-lg"
                  onClick={handlePlaceOrder}
                  disabled={loading || items.length === 0}
                  id="place-order-btn"
                >
                  {loading ? '⏳ Placing Order...' : `🍱 Place Order — ₹${totalPrice}`}
                </button>

                <p className={styles.disclaimer}>
                  ⚡ Order will be sent to the canteen immediately. Prep time ~10–15 min.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
