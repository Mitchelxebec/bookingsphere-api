import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
export const redis = new Redis(redisUrl);

redis.on("connect", () => console.log("💾 Redis connected"));
redis.on("error", (err) => console.error("Redis error: ", err));

export const blacklistToken = async (
  token: string,
  expiresInSeconds: number,
): Promise<void> => {
  const key = `blacklist:${token}`;
  await redis.set(key, "true", "EX", expiresInSeconds);
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const key = `blacklist:${token}`;
  const result = await redis.exists(key);
  return result === 1; //REDIS RETURNS 1 IF THE KEY EXISTS, 0 IF IT DOESN'T
};

export const saveOtp = async (email: string, hashedOtp: string) => {
  await redis.set(`otp:${email}`, hashedOtp, "EX", 600);
};

export const getOtp = async (email: string) => {
  return await redis.get(`otp:${email}`);
};

export const deleteOtp = async (email: string) => {
  await redis.del(`otp:${email}`);
};

// Store any data in cache with a TTL (in seconds)
export const setCache = async (
  key: string,
  data: unknown,
  ttlSeconds: number,
): Promise<void> => {
  await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
};

// Get data from cache, returns null if not found
export const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
};

// Delete a cache key (call this on writes)
export const deleteCache = async (key: string): Promise<void> => {
  await redis.del(key);
};