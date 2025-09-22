const express = require('express');
const { query } = require('../utils/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { rows } = await query('SELECT id, email, name, role, created_at FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch users' });
  }
});

module.exports = router;
