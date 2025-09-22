const express = require('express');
const { query } = require('../utils/db');
const { authenticate, authorize } = require('../middleware/auth');
const { invalidateAnalyticsCache } = require('../services/cache');

const router = express.Router();
router.get('/', authenticate, authorize(['admin','user','read-only']), async (req, res) => {
  try {
    const uid = req.user.id;
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(100, parseInt(req.query.limit || '20'));
    const offset = (page - 1) * limit;

    const filters = ['user_id = $1'];
    const params = [uid];
    let idx = params.length + 1;

    if (req.query.category) { filters.push(`category_id = $${idx++}`); params.push(req.query.category); }
    if (req.query.type) { filters.push(`type = $${idx++}`); params.push(req.query.type); }
    if (req.query.from) { filters.push(`occurred_at >= $${idx++}`); params.push(req.query.from); }
    if (req.query.to) { filters.push(`occurred_at <= $${idx++}`); params.push(req.query.to); }

    const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
    const base = `SELECT * FROM transactions ${where} ORDER BY occurred_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);
    const { rows } = await query(base, params);
    res.json({ data: rows, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch transactions' });
  }
});

router.post('/', authenticate, authorize(['admin','user']), async (req, res) => {
  try {
    const uid = req.user.id;
    const { amount, type, category_id, description, occurred_at } = req.body;
    const ins = `INSERT INTO transactions (user_id, amount, type, category_id, description, occurred_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const { rows } = await query(ins, [uid, amount, type, category_id || null, description || null, occurred_at || new Date()]);
    await invalidateAnalyticsCache(uid);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create transaction' });
  }
});

router.put('/:id', authenticate, authorize(['admin','user']), async (req, res) => {
  try {
    const uid = req.user.id;
    const tid = req.params.id;
    if (req.user.role === 'user') {
      const { rows } = await query('SELECT user_id FROM transactions WHERE id=$1', [tid]);
      if (!rows[0] || rows[0].user_id !== uid) return res.status(403).json({ error: 'Not allowed' });
    }
    const { amount, type, category_id, description, occurred_at } = req.body;
    const upd = `UPDATE transactions SET amount=$1, type=$2, category_id=$3, description=$4, occurred_at=$5, updated_at=now() WHERE id=$6 RETURNING *`;
    const { rows } = await query(upd, [amount, type, category_id || null, description || null, occurred_at || new Date(), tid]);
    await invalidateAnalyticsCache(uid);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update' });
  }
});

// delete
router.delete('/:id', authenticate, authorize(['admin','user']), async (req, res) => {
  try {
    const uid = req.user.id;
    const tid = req.params.id;
    if (req.user.role === 'user') {
      const { rows } = await query('SELECT user_id FROM transactions WHERE id=$1', [tid]);
      if (!rows[0] || rows[0].user_id !== uid) return res.status(403).json({ error: 'Not allowed' });
    }
    await query('DELETE FROM transactions WHERE id=$1', [tid]);
    await invalidateAnalyticsCache(uid);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete' });
  }
});

module.exports = router;
