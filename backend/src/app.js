require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRouter = require('./routes/auth');
const txRouter = require('./routes/transactions');
const analyticsRouter = require('./routes/analytics');
const userRouter = require('./routes/users');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 5 });
const txLimiter = rateLimit({ windowMs: 60*60*1000, max: 100 });
const analyticsLimiter = rateLimit({ windowMs: 60*60*1000, max: 50 });

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/transactions', txLimiter, txRouter);
app.use('/api/analytics', analyticsLimiter, analyticsRouter);
app.use('/api/users', userRouter);

app.get('/', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'server error' });
});

module.exports = app;
