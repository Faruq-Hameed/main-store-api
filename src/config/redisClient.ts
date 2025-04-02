import Redis from 'ioredis';

// Create Redis client
const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

// Export redis client for use in other parts of your application
export default redis;