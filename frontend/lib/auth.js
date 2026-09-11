import jwt from 'jsonwebtoken';
import User from './models/User.js';
import connectDB from './db.js';

export async function verifyToken(req) {
  await connectDB();
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'No token provided. Please login.', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return { error: 'User not found. Token invalid.', status: 401 };
    }
    
    return { user };
  } catch (error) {
    return { error: 'Token expired or invalid. Please login again.', status: 401 };
  }
}

export function requireStaff(user) {
  if (user?.role !== 'staff') {
    return { error: 'Access denied. Staff only.', status: 403 };
  }
  return null; // No error
}
