import mongoose from "mongoose";
import { NotFoundException, BadRequestException } from "@/exceptions";
import Product, { IProduct } from "@/models/Product";
import { basicManagerFields } from "@/utils/common";
import { paginate, PaginatedResult, SortOption } from "@/utils/paginator";
import ProductChangeHistoryModel, { IProductChangeHistory } from "@/models/ProductChangeHistory";


class ProductService {
  /**
   * Create a new product
   * @param productData Product data
   * @returns Newly created product
   */
  async createProduct(productsData: IProduct[]): Promise<IProduct[]> {
    try {
      const product = await Product.create(productsData);
   
      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all products with pagination
   * @param page Page number
   * @param limit Items per page
   * @param filter Optional filter criteria
   * @returns Paginated products
   * @Note: Pagination helper function could have been created instead of handling it here but since 
   * this is just used once, I decided to implement it manually instead of using helper function
   */
  async getAllProducts(
    searchQuery: Record<string, any>

  ): Promise<{
    products: IProduct[];
    totalDocs: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }> {
    const { name,
      category,
      minPrice,
      maxPrice,
      price,
      page = 1,
      status = 'active', //only active products will be returned by default
      limit = 10, ...otherFields } = searchQuery

    // // Generate a unique cache key based on the search query to be used by rediClient
    // const cacheKey = `products:${JSON.stringify(searchQuery)}`;

    // // Check if the data is already cached with redis
    // const cachedData = await redisClient.get(cacheKey);

    // if (cachedData) {
    //   // If data is found in the cache, return it
    //   const { products, totalDocs, totalPages, currentPage } = JSON.parse(cachedData);
    //   return { products, totalDocs, totalPages, currentPage };
    // }
    const sort: SortOption = { createdAt: -1 };
    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort,
      populate: [// fields to populate
        { path: 'createdBy', select: basicManagerFields },
        { path: 'lastUpdatedBy', select: basicManagerFields },
      ],
    };
    // Construct the dynamic search query if not in redis cache
    const dbQuery: Record<string, any> = {
      ...otherFields,
      ...(name && { name: { $regex: name, $options: 'i' } }), // if product name is passed/ 'i' makes it case-insensitive
      ...(category && { category: { $regex: category, $options: 'i' } }), // if product category is passed
      ...(minPrice && { price: { $gte: minPrice } }), // if minimum price is passed
      ...(maxPrice && { price: { $lte: maxPrice } }), // if maximum price is passed
      ...(price && { price }), // if price is passed (min and max prices would be ignored)
    };
    try {
      const result = await paginate(Product, dbQuery, options);

      // await redisClient.setex(cacheKey, 3600, JSON.stringify(result));  // Cache for 1 hour
      return {
        products: result.docs,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.page,
        limit: result.limit
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single product by ID
   * @param productId Product ID
   * @returns Product or null if not found
   */
  async getProductById(productId: string): Promise<IProduct> {
    try {
      // // Try fetching from cache (Redis)
      // const cachedProduct = await redisClient.get(`product:${productId}`);

      // if (cachedProduct) {
      //   // If product is found in cache, parse and return
      //   console.log('Product found in cached: ....')
      //   return JSON.parse(cachedProduct);
      // }
      // console.log('Product not found in cached')
      const product = await Product.findById(productId)
        .populate('createdBy', 'id firstname lastname') //populate createdBy field with the only  selected fields
        .populate('createdBy', 'id firstname lastname') //populate createdBy field with the only  selected fields
      if (!product) {
        throw new NotFoundException(`Product with id ${productId} not found`);
      }
      // // Cache the product in Redis with a 1-hour expiration time
      // await redisClient.set(`product:${productId}`, JSON.stringify(product), 'EX', 3600);
      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a product
   * @param productId Product ID
   * @param updateData Update data
   * @returns Updated product or null if not found
   */
  async updateProduct(
    updateData: Partial<IProduct>,
  ): Promise<IProduct> {
    const { lastUpdatedBy, id } = updateData
    // Start a session
    const session = await mongoose.startSession();
    try {
      // Start a transaction
      session.startTransaction();

      const previousState = await Product.findById(id)

      if (!previousState) {
        throw new NotFoundException('Product not found to update');
      }

      // Update product quantity atomically
      const newState = await Product.findByIdAndUpdate(
        id,
        { ...updateData },
        { new: true, transaction: session, runValidators: true },
      ).populate([{ path: 'createdBy', select: basicManagerFields },
      { path: 'lastUpdatedBy', select: basicManagerFields }
      ])

      if (!newState) {
        throw new NotFoundException('Product not found to update');
      }

      //captured the operation states 
      await ProductChangeHistoryModel.create({
        productId: previousState._id,
        previousState,
        newState,
        updatedBy: lastUpdatedBy,
        createdAt: previousState.createdAt//maintaining same  creation date
      });
      // Commit the transaction
      await session.commitTransaction();
      return newState; //return the updated products


    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();
      throw error;
    }
    finally {
      // End the session
      session.endSession();
    }
  }

  /**
   * Delete a product
   * @param productId Product ID
   * @returns  product or null if not found
   */




  async getProductHistories(
    searchQuery: Record<string, any>

  ): Promise<{
    docs: IProductChangeHistory[];
    totalDocs: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }> {
    const {
      startDate,
      endDate,
      date,
      page = 1,
      limit = 10 } = searchQuery

    const sort: SortOption = { createdAt: -1 };
    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort,
      populate: [// fields to populate
        { path: 'createdBy', select: basicManagerFields },
        { path: 'lastUpdatedBy', select: basicManagerFields },
      ],
    };
    // Construct the dynamic search query if not in redis cache
    const dbQuery: Record<string, any> = {
      ...(startDate && { createdAt: { $gte: new Date(startDate as string) } }), // if startDate is passed
      ...(endDate && { createdAt: { $lte: new Date(endDate as string) } }), // if end date is passed
      ...(date && { createdAt: new Date(date as string) }), // if date is passed (start and end dates would be ignored)
    };
    try {
      const result = await paginate(ProductChangeHistoryModel, dbQuery, options);

      return {
        docs: result.docs,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.page,
        limit: result.limit
      };
    } catch (error) {
      throw error;
    }
  }
  /**
   * Update product quantity
   * @param productId Product ID
   * @param quantity New quantity
   * @returns Updated product or null if not found
   */
  async updateProductQuantity(
    productId: string,
    quantity: number
  ): Promise<IProduct | null> {
    try {
      const product = await this.getProductById(productId);


      product.availableQuantity = +quantity;

      await product.save();

      return product;
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductService();