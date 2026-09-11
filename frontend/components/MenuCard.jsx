'use client';
import { useRef } from 'react';
import { useCart } from '@/context/CartContext';
import styles from './MenuCard.module.css';

const CATEGORY_ICONS = { snacks: '🥪', meals: '🍱', drinks: '🥤', combos: '🎁' };

export default function MenuCard({ item }) {
  const { addItem, items } = useCart();
  const cardRef = useRef(null);
  const inCart = items.find((i) => i._id === item._id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!item.available) return;
    triggerFlyAnimation(e);
    addItem(item);
  };

  // Whole card click also adds to cart
  const handleCardClick = () => {
    if (!item.available) return;
    if (cardRef.current) {
      const fakeEvent = { currentTarget: cardRef.current, stopPropagation: () => {} };
      triggerFlyAnimation(fakeEvent);
    }
    addItem(item);
  };

  const triggerFlyAnimation = (e) => {
    // Get cart icon position (bottom nav cart icon)
    const cartEl = document.getElementById('bottom-nav-cart');
    const sourceEl = cardRef.current;
    if (!cartEl || !sourceEl) return;

    const srcRect = sourceEl.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();

    // Create flying element
    const fly = document.createElement('div');
    fly.className = styles.flyItem;
    fly.textContent = CATEGORY_ICONS[item.category] || '🍴';
    fly.style.cssText = `
      position: fixed;
      z-index: 9999;
      left: ${srcRect.left + srcRect.width / 2 - 20}px;
      top: ${srcRect.top + srcRect.height / 2 - 20}px;
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent);
      border-radius: 50%;
      pointer-events: none;
      transition: all 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      opacity: 1;
      transform: scale(1);
    `;
    document.body.appendChild(fly);

    // Force reflow
    fly.getBoundingClientRect();

    // Animate to cart
    const targetX = cartRect.left + cartRect.width / 2 - 20;
    const targetY = cartRect.top + cartRect.height / 2 - 20;
    fly.style.left = `${targetX}px`;
    fly.style.top = `${targetY}px`;
    fly.style.opacity = '0';
    fly.style.transform = 'scale(0.3)';

    // Bounce the cart icon
    setTimeout(() => {
      if (cartEl) {
        cartEl.classList.add(styles.cartBounce);
        setTimeout(() => cartEl.classList.remove(styles.cartBounce), 400);
      }
    }, 620);

    fly.addEventListener('transitionend', () => fly.remove());
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${!item.available ? styles.unavailable : ''} ${inCart ? styles.inCart : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      {/* Image */}
      <div className={styles.imageWrap}>
        <div className={styles.imagePlaceholder}>
          <span className={styles.catIcon}>{CATEGORY_ICONS[item.category] || '🍴'}</span>
        </div>
        <span className={styles.categoryTag}>{item.category}</span>
        {inCart && <div className={styles.inCartOverlay}>✓ In Cart ({inCart.qty})</div>}
        {!item.available && <div className={styles.unavailableOverlay}>Unavailable</div>}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{item.name}</h3>
          <div className={styles.rating}>⭐ {item.rating?.toFixed(1)}</div>
        </div>
        <p className={styles.desc}>{item.description}</p>
        <div className={styles.meta}>
          <span className={styles.prepTime}>⏱ {item.prepTime} min</span>
        </div>
        <div className={styles.footer}>
          <span className={styles.price}>₹{item.price}</span>
          <button
            className={`btn btn-sm ${inCart ? 'btn-accent' : 'btn-primary'}`}
            onClick={handleAddToCart}
            disabled={!item.available}
          >
            {inCart ? `✓ Added (${inCart.qty})` : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
