import Redis from "ioredis";

export const redisClient = new Redis({
  host: 'localhost', 
  port: 6379,
  db:0
});

redisClient.on("connect", () => console.log("✅ Connected to Redis"));
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

