import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './ManageMenu.module.css';

export default function ManageMenu() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Snacks',
    image: '',
    veg: true,
    available: true
  });

  const categories = ['Snacks', 'Beverages', 'Lunch', 'Breakfast', 'Desserts'];

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu?category=all`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to fetch menu', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item._id);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image || '',
        veg: item.veg,
        available: item.available
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '', description: '', price: '', category: 'Snacks', image: '', veg: true, available: true
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `${process.env.NEXT_PUBLIC_API_URL}/menu/${editingItem}` : `${process.env.NEXT_PUBLIC_API_URL}/menu`;
      const method = editingItem ? 'PUT' : 'POST';
      
      const payload = { ...formData, price: Number(formData.price) };
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save item');
      
      setModalOpen(false);
      fetchMenu();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete item');
      fetchMenu();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/${id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ available: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to update availability');
      fetchMenu();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '2rem auto' }} />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Menu Items ({items.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>
          ➕ Add New Item
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id} className={!item.available ? styles.unavailableRow : ''}>
                <td>
                  <div className={styles.itemInfo}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className={styles.itemImg} />
                    ) : (
                      <div className={styles.placeholderImg}>🍽️</div>
                    )}
                    <div>
                      <div className={styles.itemName}>
                        <span className={item.veg ? styles.vegIcon : styles.nonVegIcon}>●</span>
                        {item.name}
                      </div>
                      <div className={styles.itemDesc}>{item.description}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge">{item.category}</span></td>
                <td className={styles.price}>₹{item.price}</td>
                <td>
                  <button 
                    className={`badge ${item.available ? 'badge-success' : 'badge-error'}`}
                    onClick={() => toggleAvailability(item._id, item.available)}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {item.available ? 'Available' : 'Out of Stock'}
                  </button>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenModal(item)}>✏️</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDelete(item._id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <input required className="form-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price (₹)</label>
                  <input required type="number" min="0" className="form-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (Optional)</label>
                <input className="form-input" type="url" placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={formData.veg} onChange={e => setFormData({...formData, veg: e.target.checked})} />
                  Vegetarian (Green Dot)
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={formData.available} onChange={e => setFormData({...formData, available: e.target.checked})} />
                  Available Now
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1.5rem' }}>
                {editingItem ? 'Save Changes' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
