const express = require('express');
const { queryAll, queryGet } = require('../db/database');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM products ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const row = await queryGet('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]);
    if (!row) return res.status(404).json({ error: 'Product not found.' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

module.exports = router;