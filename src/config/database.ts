import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from './dev';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.database.db_uri|| 'mongodb://localhost:27017/store_management');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};

export default connectDB;