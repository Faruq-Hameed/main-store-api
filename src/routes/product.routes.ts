import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductHistories,
} from '@/controllers/products.controller';
import { Authenticator } from '@/middlewares/auth.middlewares';

const router = express.Router();

router.use(Authenticator); //authenticating middleware

router
  .route('/')
  .post(createProduct) //create product
  .get(getAllProducts); //get all products(with pagination and filter query)

router
  .route('/:id')
  .get(getProductById) //get single product by id
  .put(updateProduct) //update product details
  .delete(deleteProduct); //delete product(soft delete)

router.get('/:id/history', getProductHistories);

export default router;
