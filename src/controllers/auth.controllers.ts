import { Request, Response, NextFunction } from 'express';
import Manager, { IManager } from '../models/Managers.model';
import { asyncHandler, generateToken, sendResponse } from '../utils';
import { AppError } from '../utils/Errors/AppErrors';

// @desc    Register Manager
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  // Check if Manager already exists
  const existingManager = await Manager.findOne({ email });
  if (existingManager) {
    return next(new AppError('manager already exists', 400));
  }

  // Create manager
  const manager: IManager = await Manager.create({
    name,
    email,
    password,
    role: role || 'manager'
  });

  // Generate token
  const token = generateToken(manager._id as string);

  sendResponse(res, 201, { token, manager: { id: manager._id, name: manager.name, email: manager.email, role: manager.role } }, 'manager registered successfully');
});

// @desc    Login manager
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if manager exists
  const manager = await Manager.findOne({ email }).select('+password');
  if (!manager) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await manager.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Generate token
  const token = generateToken(manager._id as string);

  sendResponse(res, 200, { token, manager: { id: manager._id, name: manager.name, email: manager.email, role: manager.role } }, 'Login successful');
});

// @desc    Get current logged in manager
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const manager = await Manager.findById(req.manager!._id);

  if (!manager) {
    return next(new AppError('manager not found', 404));
  }

  sendResponse(res, 200, { manager }, 'manager profile retrieved successfully');
});