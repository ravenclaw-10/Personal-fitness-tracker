const Redis = require('ioredis');
const redis = new Redis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT || 6379 });

async function cacheSet(key, value, ttlSeconds) {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

async function cacheGet(key) {
  const v = await redis.get(key);
  return v ? JSON.parse(v) : null;
}

async function invalidateAnalyticsCache(userId) {
  try {
    await redis.del(`analytics:user:${userId}`);
  } catch (e) { console.error('redis del err', e); }
}

module.exports = { redis, cacheSet, cacheGet, invalidateAnalyticsCache };
