const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/verifyToken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, rollNo, classSection, department, staffCode } = req.body;

    if (!name || !email || !password || !rollNo || !classSection || !department) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { rollNo: rollNo.toUpperCase() }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Email or Roll No already registered.' });
    }

    // Staff registration requires special code
    const role = staffCode === 'CANTEEN2026' ? 'staff' : 'student';

    const user = await User.create({ name, email, password, rollNo, classSection, department, role });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        classSection: user.classSection,
        department: user.department,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        classSection: user.classSection,
        department: user.department,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET /api/auth/me — Validate token & return user
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
