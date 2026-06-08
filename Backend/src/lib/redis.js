import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

let redis;
if (process.env.REDIS_URI) {
  redis = new Redis(process.env.REDIS_URI);
  redis.on('connect', ()=> console.log("redis connected"));
  redis.on('error', (err)=> console.error("Redis Error:", err.message));
} else {
  console.log("No REDIS_URI provided. Using simple in-memory mock for Redis to prevent crashes.");
  const store = new Map();
  redis = {
    hset: async (k, v) => store.set(k, { ...store.get(k), ...v }),
    expire: async () => {},
    hgetall: async (k) => store.get(k) || null,
    del: async (k) => store.delete(k),
    hincrby: async (k, f, i) => {
      const obj = store.get(k) || {};
      obj[f] = (parseInt(obj[f]) || 0) + i;
      store.set(k, obj);
      return obj[f];
    },
    set: async (k, v, ...args) => store.set(k, v),
    get: async (k) => store.get(k) || null,
  };
}

export default redis;
