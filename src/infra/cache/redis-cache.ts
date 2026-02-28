import { redis } from "./redis-client";

export class RedisCache {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);

    if (!data) return null;

    return JSON.parse(data);
  }

  async set(key: string, value: unknown, ttl = 60) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  }

  async delete(key: string) {
    await redis.del(key);
  }

  async deletePattern(pattern: string) {
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}
