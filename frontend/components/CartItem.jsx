'use client';
import { useCart } from '@/context/CartContext';
import styles from './CartItem.module.css';

const CATEGORY_ICONS = { snacks: '🥪', meals: '🍱', drinks: '🥤', combos: '🎁' };

export default function CartItem({ item }) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className={styles.item}>
      <div className={styles.icon}>{CATEGORY_ICONS[item.category] || '🍴'}</div>

      <div className={styles.details}>
        <h4 className={styles.name}>{item.name}</h4>
        <span className={styles.unitPrice}>₹{item.price} each</span>
      </div>

      <div className={styles.controls}>
        <button className={styles.qtyBtn} onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
        <span className={styles.qty}>{item.qty}</span>
        <button className={styles.qtyBtn} onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
      </div>

      <div className={styles.right}>
        <span className={styles.total}>₹{(item.price * item.qty).toFixed(0)}</span>
        <button className={styles.removeBtn} onClick={() => removeItem(item._id)} title="Remove">✕</button>
      </div>
    </div>
  );
}
