import { NextFunction, Request, Response } from 'express';
import ProductService from '@/services/product.service';
import { IProduct, ProductStatus } from '@/models/Product';
import { BadRequestException, NotFoundException } from '@/exceptions';
import { StatusCodes } from 'http-status-codes';
import { productValidator } from '@/validators/product.schema';

class ProductController {
  /**
   * Create a new product
   * @route POST /api/products
   */
  async createProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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
      const product = await ProductService.createProduct(
        productsWithManagerInfo,
      );
      res.status(StatusCodes.OK).json({
        message: 'Products added successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all products with pagination
   * @route GET /api/products
   */
  async getAllProducts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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
  }

  /**
   * Get a single product by ID
   * @route GET /api/products/:id
   */
  async getProductById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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
  }

  /**This is a middleware function that will check if product id is valid or not */
  async isProductAvailable(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const product = await ProductService.getProductById(req.params.id);

      if (!product) {
        throw new NotFoundException('Product not found');
      } else next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a product
   * @route PUT /api/products/:id
   */
  async updateProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { value, error } = productValidator(
        req.body as Partial<IProduct>,
        true,
      );
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }

      if (
        (value.status && !req.url.endsWith('/status')) ||
        value.availableQuantity
      ) {
        //ensure that status and quantity are not updated here
        throw new BadRequestException(
          'Status or quantity update not allowed here!',
        );
      }
      value.lastUpdatedBy = req.manager?.id;
      value.id = req.params.id;
      const product = await ProductService.updateProduct(
        value as Partial<IProduct>,
        req.body.note,
      );
      res.status(StatusCodes.OK).json({
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a product status
   * @route PUT /api/products/:id/status
   */
  async updateProductStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const status = req.body.status as string;
      const validStatus = [ 'ARCHIVED', 'ACTIVE'];
      if (!status || validStatus.includes(req.body.status)) {
        //validate that the supplied status is valid status
        throw new BadRequestException(
          `Only 'ARCHIVE' or 'ACTIVE' is allowed here`,
        );
      }
      if (!req.body.note) {
        throw new BadRequestException('note is required!');
      }
      const product = await ProductService.updateProduct(
        { status: status as ProductStatus },
        req.body.note as string,
      );
      res.status(StatusCodes.OK).json({
        message: 'Product status updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a product
   * @route DELETE /api/products/:id
   */
  async deleteProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
       await ProductService.updateProduct(
        { status: ProductStatus.DELETED },
        req.body.note as string,
      );
      res.status(StatusCodes.OK).json({
        message: 'Product deleted successfully',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductHistories(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Get products with the query parameters
      const result = await ProductService.getProductHistories(req.query);

      res.status(StatusCodes.OK).json({
        message: 'Products histories fetched successfully',
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
  }

  /**
   * Update product quantity
   * @route PATCH /api/products/:id/quantity
   */
  async updateProductQuantity(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { quantity } = req.query;

      if (!quantity || typeof quantity !== 'number' || quantity === 0) {
        throw new BadRequestException(
          'Invalid quantity. Quantity required and must be a number greater than zero',
        );
      }

      const product = await ProductService.updateProductQuantity(
        req.params.id,
        parseInt(quantity as string),
      );

      res.status(StatusCodes.OK).json({
        message: 'Product quantity updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
