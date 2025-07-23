import Redis from "ioredis";

export const redisClient = new Redis(process.env.redis);

redisClient.on("connect", () => console.log("✅ Connected to Redis"));
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));


