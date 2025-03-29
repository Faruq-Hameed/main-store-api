import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/Errors/AppErrors';
import { asyncHandler, sendResponse } from '../utils';
import Product from '../models/Product';

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private
export const createProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  req.body.createdBy = req.manager!._id;
  req.body.updatedBy = req.manager!._id;

  const product = await Product.create(req.body);

  sendResponse(res, 201, { product }, 'Product created successfully');
});

// @desc    Get all products with pagination, filtering and sorting
// @route   GET /api/v1/products
// @access  Public
export const getProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Build query
  let query: any = {};

  // Filter by name (case-insensitive)
  if (req.query.name) {
    query.name = { $regex: req.query.name, $options: 'i' };
  }

  // Filter by category
  if (req.query.category) {
    query.category = { $regex: req.query.category, $options: 'i' };
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) {
      query.price.$gte = parseFloat(req.query.minPrice as string);
    }
    if (req.query.maxPrice) {
      query.price.$lte = parseFloat(req.query.maxPrice as string);
    }
  }

  // Filter by active status
  if (req.query.isActive) {
    query.isActive = req.query.isActive === 'true';
  }

  // Sorting
  let sort = {};
  if (req.query.sort) {
    const sortBy = (req.query.sort as string).split(',').join(' ');
    sort = { [sortBy]: req.query.order === 'desc' ? -1 : 1 };
  } else {
    sort = { createdAt: -1 }; // Default sort by newest
  }

  // Execute query with pagination
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate({ path: 'createdBy', select: 'name email' })
    .populate({ path: 'updatedBy', select: 'name email' });

  // Pagination result
  const pagination = {
    total,
    pages: Math.ceil(total / limit),
    page,
    limit
  };

  sendResponse(res, 200, { products, pagination }, 'Products retrieved successfully');
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)
    .populate({ path: 'createdBy', select: 'name email' })
    .populate({ path: 'updatedBy', select: 'name email' });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  sendResponse(res, 200, { product }, 'Product retrieved successfully');
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private
export const updateProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Add updatedBy field
  req.body.updatedBy = req.manager!._id;

  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if manager is admin or the creator of the product
  const isAdmin = req.manager!.role === 'admin';
  const isCreator = product.createdBy.toString() === (req.manager!._id as string).toString();

  if (!isAdmin && !isCreator) {
    return next(new AppError('Not authorized to update this product', 403));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  sendResponse(res, 200, { product }, 'Product updated successfully');
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if manager is admin or the creator of the product
  const isAdmin = req.manager!.role === 'admin';
  const isCreator = product.createdBy.toString() === (req.manager!._id as string).toString();

  if (!isAdmin && !isCreator) {
    return next(new AppError('Not authorized to delete this product', 403));
  }

  await product.deleteOne();

  sendResponse(res, 200, {}, 'Product deleted successfully');
});

// @desc    Get product statistics
// @route   GET /api/v1/products/stats
// @access  Private/Admin
export const getProductStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalInventory: { $sum: '$inventory' }
      }
    }
  ]);

  const categoryCounts = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        totalInventory: { $sum: '$inventory' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  sendResponse(res, 200, { stats: stats[0], categoryCounts }, 'Product statistics retrieved successfully');
});