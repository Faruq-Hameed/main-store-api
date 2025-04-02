import { NextFunction, Request, Response } from 'express';
import ProductService from '@/services/product.service';
import { IProduct, ProductStatus } from '@/models/Product';
import { BadRequestException, NotFoundException } from '@/exceptions';
import { StatusCodes } from 'http-status-codes';
import { productValidator } from '@/validators/product.schema';

/**
 * Create a new product
 * @route POST /api/products
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { value, error } = productValidator(req.body as IProduct[], false);
    if (error) {
      throw new BadRequestException(error.details[0].message);
    }
    // Set the manager's ID as createdBy and lastUpdatedBy for each product
    const productsWithManagerInfo = value.map((product: IProduct) => ({
      ...product,
      createdBy: req.manager?.id,
      lastUpdatedBy: req.manager?.id,
    }));
    const product = await ProductService.createProduct(productsWithManagerInfo);
    res.status(StatusCodes.OK).json({
      message: 'Products added successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all products with pagination
 * @route GET /api/products
 */
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get products with the query parameters
    const result = await ProductService.getAllProducts(req.query);

    res.status(StatusCodes.OK).json({
      message: 'Products fetched successfully',
      data: result.products,
      pagination: {
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        hasNextPage: result.currentPage < result.totalPages,
        hasPrevPage: result.currentPage > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product by ID
 * @route GET /api/products/:id
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await ProductService.getProductById(req.params.id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Product fetched successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a product
 * @route PUT /api/products/:id
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { value, error } = productValidator(
      req.body as Partial<IProduct>,
      true,
    );
    if (error) {
      throw new BadRequestException(error.details[0].message);
    }

    value.lastUpdatedBy = req.manager?.id;
    value.id = req.params.id;
    const product = await ProductService.updateProduct(
      value as Partial<IProduct>,
    );
    res.status(StatusCodes.OK).json({
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Delete a product
 * @route DELETE /api/products/:id
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await ProductService.updateProduct({ status: ProductStatus.DELETED });
    res.status(StatusCodes.OK).json({
      message: 'Product deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const getProductHistories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get products with the query parameters
    const result = await ProductService.getProductHistories(req.query);

    res.status(StatusCodes.OK).json({
      message: 'Products histories fetched successfully',
      data: result.docs,
      pagination: {
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        hasNextPage: result.currentPage < result.totalPages,
        hasPrevPage: result.currentPage > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
