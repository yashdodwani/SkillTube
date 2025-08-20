const Redis = require("ioredis");

const redis = new Redis({
    host: "localhost",  // Redis is running on localhost (inside Docker)
    port: 6379,         // Default Redis port
});

redis.on("connect", () => console.log("✅ Connected to Redis"));
redis.on("error", (err) => console.error("❌ Redis Connection Error:", err));

module.exports = redis;