const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyToken, requireStaff } = require('../middleware/verifyToken');

// Generate unique order ID: ORD-YYYYMMDD-XXXXX
async function generateOrderId() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${dateStr}-`;

  const lastOrder = await Order.findOne(
    { orderId: { $regex: `^${prefix}` } },
    { orderId: 1 },
    { sort: { createdAt: -1 } }
  );

  let seq = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderId.split('-')[2]) || 0;
    seq = lastSeq + 1;
  }
  return `${prefix}${String(seq).padStart(5, '0')}`;
}

// POST /api/orders — Student places an order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, totalAmount, specialInstructions } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      user: req.user._id,
      studentName: req.user.name,
      rollNo: req.user.rollNo,
      classSection: req.user.classSection,
      department: req.user.department,
      items,
      totalAmount,
      specialInstructions: specialInstructions || '',
    });

    // Emit to all connected canteen staff via socket
    const io = req.app.get('io');
    if (io) io.emit('new_order', order);

    res.status(201).json({ message: 'Order placed!', order });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: 'Failed to place order.' });
  }
});

// GET /api/orders/my — Student's own orders
router.get('/my', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// GET /api/orders — Staff: all orders (with optional status filter)
router.get('/', verifyToken, requireStaff, async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// PATCH /api/orders/:id/status — Staff updates order status
router.patch('/:id/status', verifyToken, requireStaff, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Notify student via socket
    const io = req.app.get('io');
    if (io) io.emit('order_updated', { orderId: order.orderId, status: order.status, _id: order._id });

    res.json({ message: 'Status updated.', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status.' });
  }
});

module.exports = router;
