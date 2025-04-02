import app from './app';
import connectDB from './config/database';
import redisClient from '@/redisClient';

// Connect to database
connectDB();

//connect redis
// // Handle connection events
// redisClient.on('connect', () => {
//   console.log('Successfully connected to redisClient');
// });

// redisClient.on('error', (err) => {
//   console.error('redisClient connection error:', err);
// });


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.log(`Error: ${err.message}`);
  // Exit process
  process.exit(1);
});