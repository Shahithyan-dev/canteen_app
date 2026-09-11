'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '../login/auth.module.css';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Chemical Engineering',
  'Business Administration',
  'Arts & Science',
  'Other',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [roleType, setRoleType] = useState('student'); // 'student' | 'staff'
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    rollNo: '', classSection: '', department: DEPARTMENTS[0], staffCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      
      // Clean up irrelevant fields based on role
      if (roleType === 'staff') {
        payload.rollNo = 'STAFF-' + Math.floor(Math.random() * 1000);
        payload.classSection = 'STAFF';
        payload.department = 'Canteen';
      } else {
        payload.staffCode = ''; // Ensure student doesn't send staff code
      }

      const user = await register(payload);
      alert('Registration successful! Please login.');
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.bgDeco1} />
      <div className={styles.bgDeco2} />

      <div className={`${styles.authCard} ${styles.authCardWide}`}>
        <div className={styles.authLogo}>
          <span className={styles.logoIcon}>🍱</span>
          <span className={styles.logoText}>Campus<span className={styles.logoAccent}>Eats</span></span>
        </div>
        
        <h1 className={styles.title}>Join the Canteen</h1>
        <p className={styles.subtitle}>Create your account to start ordering</p>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Role Toggle Tabs */}
        <div className={styles.roleTabs}>
          <button 
            className={`${styles.roleTab} ${roleType === 'student' ? styles.roleTabActive : ''}`}
            onClick={() => setRoleType('student')}
            type="button"
          >
            🎓 Student
          </button>
          <button 
            className={`${styles.roleTab} ${roleType === 'staff' ? styles.roleTabActive : ''}`}
            onClick={() => setRoleType('staff')}
            type="button"
          >
            👨‍🍳 Canteen Staff
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* Common Fields */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" required />
          </div>

          <div className="form-group">
            <label className="form-label">College Email</label>
            <input type="email" className="form-input" name="email" value={form.email} onChange={handleChange} placeholder="rahul@college.edu" required />
          </div>

          {/* Student Specific Fields */}
          {roleType === 'student' && (
            <>
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input type="text" className="form-input" name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. 21CS001" required />
              </div>
              <div className="form-group">
                <label className="form-label">Class & Section</label>
                <input type="text" className="form-input" name="classSection" value={form.classSection} onChange={handleChange} placeholder="e.g. 3rd Year CSE-A" required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Department</label>
                <select className="form-input" name="department" value={form.department} onChange={handleChange} required>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Staff Specific Fields */}
          {roleType === 'staff' && (
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Secret Staff Code</label>
              <input 
                type="text" 
                className="form-input" 
                name="staffCode" 
                value={form.staffCode} 
                onChange={handleChange} 
                placeholder="Enter secret code provided by admin" 
                required 
              />
              <p className={styles.helpText}>You need the secret code to register as canteen staff.</p>
            </div>
          )}

          {/* Passwords */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-input" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating account...' : `Register as ${roleType === 'student' ? 'Student' : 'Staff'}`}
            </button>
          </div>
        </form>

        <p className={styles.footerText}>
          Already have an account? <Link href="/login" className={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
