const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { verifyToken, requireStaff } = require('../middleware/verifyToken');

// GET /api/menu — All available menu items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { available: true };
    if (category && category !== 'all') filter.category = category;

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu.' });
  }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json({ item });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch item.' });
  }
});

// POST /api/menu — Staff only: add item
router.post('/', verifyToken, requireStaff, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ item });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add item.' });
  }
});

// PATCH /api/menu/:id/availability — Toggle availability
router.patch('/:id/availability', verifyToken, requireStaff, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { available: req.body.available },
      { new: true }
    );
    res.json({ item });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update availability.' });
  }
});

// PUT /api/menu/:id — Staff only: edit item
router.put('/:id', verifyToken, requireStaff, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json({ item });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update item.' });
  }
});

// DELETE /api/menu/:id — Staff only: delete item
router.delete('/:id', verifyToken, requireStaff, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete item.' });
  }
});

module.exports = router;
