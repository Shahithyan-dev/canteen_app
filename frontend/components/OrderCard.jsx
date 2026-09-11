'use client';
import styles from './OrderCard.module.css';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   icon: '⏳', cls: 'badge-pending' },
  preparing: { label: 'Preparing', icon: '👨‍🍳', cls: 'badge-preparing' },
  ready:     { label: 'Ready!',    icon: '✅', cls: 'badge-ready' },
  delivered: { label: 'Delivered', icon: '🎉', cls: 'badge-delivered' },
  cancelled: { label: 'Cancelled', icon: '❌', cls: 'badge-cancelled' },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function OrderCard({ order, onStatusChange, isStaff }) {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const statuses = ['pending', 'preparing', 'ready', 'delivered'];

  return (
    <div className={`${styles.card} ${styles[order.status]}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.orderIdWrap}>
          <span className={styles.orderIdLabel}>Order ID</span>
          <span className="badge badge-order-id">{order.orderId}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={`badge ${status.cls}`}>{status.icon} {status.label}</span>
          <span className={styles.time}>{timeAgo(order.createdAt)}</span>
        </div>
      </div>

      {/* Student info (staff view) */}
      {isStaff && (
        <div className={styles.studentInfo}>
          <div className={styles.studentDetail}><span className={styles.detailIcon}>👤</span> <strong>{order.studentName}</strong></div>
          <div className={styles.studentDetail}><span className={styles.detailIcon}>🆔</span> {order.rollNo}</div>
          <div className={styles.studentDetail}><span className={styles.detailIcon}>🏫</span> {order.classSection} — {order.department}</div>
        </div>
      )}

      {/* Items */}
      <div className={styles.items}>
        {order.items.map((item, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemQty}>× {item.qty}</span>
            <span className={styles.itemPrice}>₹{(item.price * item.qty).toFixed(0)}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.total}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalAmount}>₹{order.totalAmount}</span>
        </div>

        {/* Staff status controls */}
        {isStaff && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <div className={styles.statusBtns}>
            {statuses.slice(statuses.indexOf(order.status) + 1).map((s) => (
              <button key={s} className={`btn btn-sm btn-primary`} onClick={() => onStatusChange(order._id, s)}>
                Mark {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
              </button>
            ))}
            <button className="btn btn-sm btn-danger" onClick={() => onStatusChange(order._id, 'cancelled')}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        {statuses.map((s, i) => (
          <div key={s} className={`${styles.progressStep} ${statuses.indexOf(order.status) >= i ? styles.progressActive : ''}`} />
        ))}
      </div>
    </div>
  );
}
