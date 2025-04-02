import { Request, Response, NextFunction } from 'express';
import Manager, { IManager } from '../models/Manager';
import { generateToken } from '../utils/generateToken';
import { BadRequestException } from '@/exceptions';
import authService from '@/services/auth.service';
import { loginValidator, managerValidator } from '@/validators/managerSchema';
import { ILogin } from '@/types';
import { StatusCodes } from 'http-status-codes';

/**controller to  to create a new manager */
class AuthController {
  async createManager(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // validate the incoming data (manager details)
      const { value, error } = managerValidator(req.body as Partial<IManager>);
      if (error) {
        // / if validation fails, throw a bad request error with the validation message
        throw new BadRequestException(error.details[0].message);
      }
      const manager = await authService.addNewManager(value as IManager);
      // Generate token
      const token = generateToken(manager._id as string);
      res.status(StatusCodes.OK).json({
        message: 'Account created successfully',
        data: {
          manager,
          token,
        },
      });
    } catch (err) {
      next(err); // Catch any errors and pass it to the next error-handling middleware
    }
  }
  /**Login controller */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate the login data (email and password)
      const { value, error } = loginValidator(req.body as Partial<ILogin>);
      if (error) {
        // If validation fails, throw a bad request error with the validation message
        throw new BadRequestException(error.details[0].message);
      }

      // If validation passes, authenticate the manager using the service
      const manager = await authService.managerLogin(value as IManager);

      // Generate a token for the logged-in manager
      const token = generateToken(manager._id as string);

      // Respond with success status, token, and manager data
      res.status(StatusCodes.OK).json({
        message: 'Login successful', // Success message
        data: {
          token, // Generated token
          manager, // Manager data
        },
      });
    } catch (err) {
      // Catch any errors and pass them to the next error-handling middleware
      next(err);
    }
  }
}

export default new AuthController();
