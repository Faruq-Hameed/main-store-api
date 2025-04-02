import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Manager, { IManager } from '../models/Manager';
import { NoTokenException, TokenException } from '@/exceptions';

interface JwtPayload {
  id: string;
}

// Extend Express Request type to include the manager
declare global {
  namespace Express {
    interface Request {
      manager?: IManager;
    }
  }
}

export const Authenticator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new NoTokenException('Not authorized to access this route');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // Check if manager still exists
      const manager = await Manager.findById(decoded.id);

      if (!manager) {
        throw new TokenException('The manager belonging to this token no longer exists');
      }

      // Add user to request
      req.manager = manager;
      next();
    } catch (error) {
      throw new NoTokenException('Not authorized to access this route');
    }
  } catch (error) {
    next(error);
  }
};

// // Grant access to specific roles
// export const authorize = (...roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     if (!req.manager) {
//       next(new AppError('Manager not found', 401));
//       return;
//     }

//     if (!roles.includes(req.manager.role)) {
//       next(new AppError(`Manager role ${req.manager.role} is not authorized to access this route`, 403));
//       return;
//     }

//     next();
//   };
// };