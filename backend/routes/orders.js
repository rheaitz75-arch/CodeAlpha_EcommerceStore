const express = require('express');
const jwt = require('jsonwebtoken');
const { getDb, queryAll, saveToDisk } = require('../db/database');

const router = express.Router();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Please log in to place or view orders.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

// Create order from cart items
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    const productIds = items.map((i) => Number(i.productId));
    const placeholders = productIds.map(() => '?').join(',');
    const products = await queryAll(`SELECT * FROM products WHERE id IN (${placeholders})`, productIds);

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === Number(item.productId));
      const qty = parseInt(item.quantity, 10);
      if (!product || isNaN(qty) || qty < 1) {
        return res.status(400).json({ error: 'Invalid item or quantity in cart.' });
      }
      if (product.stock < qty) {
        return res.status(400).json({ error: `Insufficient stock for ${product.title}.` });
      }
      totalAmount += product.price * qty;
      validatedItems.push({ product, quantity: qty });
    }

    totalAmount = Number(totalAmount.toFixed(2));

    const db = await getDb();
    db.run('BEGIN TRANSACTION');
    try {
      db.run('INSERT INTO orders (user_id, total_amount) VALUES (?, ?)', [req.user.id, totalAmount]);
      const idRes = db.exec('SELECT last_insert_rowid() AS id');
      const orderId = idRes[0].values[0][0];

      for (const vItem of validatedItems) {
        db.run(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
          [orderId, vItem.product.id, vItem.quantity, vItem.product.price]
        );
        db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [
          vItem.quantity,
          vItem.product.id
        ]);
      }

      db.run('COMMIT');
      saveToDisk();

      res.status(201).json({
        message: 'Order placed successfully!',
        orderId,
        totalAmount
      });
    } catch (txErr) {
      db.run('ROLLBACK');
      throw txErr;
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process order.' });
  }
});

// Get logged-in user's orders
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const rows = await queryAll(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

module.exports = router;