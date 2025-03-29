import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config/dev';

// Generate JWT
export const generateToken = (id: string): string => {
    return jwt.sign(
      { id }, 
      config.jwt.secret as Secret, 
      {
        expiresIn: config.jwt.accessTokenExpiry || '24h'
      }as SignOptions
    );
  };

// Async handler for routes
export const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Standard response format
export const sendResponse = (res: any, statusCode: number, data: any, message: string = '') => {
  const response: any = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};