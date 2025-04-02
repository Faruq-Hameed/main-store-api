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
