import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from '@/routes/auth.routes';
import productRoutes from '@/routes/product.routes';
import ErrorHandler from '@/middlewares/errorHandlers';
import { NotFoundException } from '@/exceptions';

// Load env vars
dotenv.config();

// Create Express app
const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Route not found handler
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundException(`Route not found: ${req.originalUrl}`));
});

// Global error handler
app.use(ErrorHandler);

export default app;
