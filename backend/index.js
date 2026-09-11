require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const seedMenu = require('./config/seedMenu');
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🍱 Canteen API is running!', timestamp: new Date() });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join_canteen', () => {
    socket.join('canteen_room');
    console.log(`👨‍🍳 Staff joined canteen room: ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedMenu();
  server.listen(PORT, () => {
    console.log(`🚀 Canteen Server running on http://localhost:${PORT}`);
    console.log(`🌍 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  });
});
