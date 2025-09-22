const express = require('express');
const { query } = require('../utils/db');
const { authenticate, authorize } = require('../middleware/auth');
const { cacheGet, cacheSet } = require('../services/cache');

const router = express.Router();

router.get('/', authenticate, authorize(['admin','user','read-only']), async (req, res) => {
  try {
    const uid = req.user.id;
    const bypass = req.query.refresh === 'true';
    const cacheKey = `analytics:user:${uid}`;

    if (!bypass) {
      const cached = await cacheGet(cacheKey);
      if (cached) return res.json({ cached: true, ...cached });
    }

    // monthly totals (last 12 months)
    const monthlyQ = `SELECT to_char(date_trunc('month', occurred_at),'YYYY-MM') as month, SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense, SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income FROM transactions WHERE user_id=$1 AND occurred_at >= (current_date - interval '12 months') GROUP BY 1 ORDER BY 1`;
    const catQ = `SELECT c.name as category, SUM(t.amount) as total FROM transactions t LEFT JOIN categories c ON t.category_id=c.id WHERE t.user_id=$1 AND t.type='expense' GROUP BY c.name ORDER BY total DESC LIMIT 20`;

    const mRes = await query(monthlyQ, [uid]);
    const cRes = await query(catQ, [uid]);

    const analytics = { monthly: mRes.rows, categories: cRes.rows };
    await cacheSet(cacheKey, analytics, 15 * 60);
    res.json({ cached: false, ...analytics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to compute analytics' });
  }
});

module.exports = router;
