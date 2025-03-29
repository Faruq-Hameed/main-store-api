import { Router } from 'express';
import { getProducts, createProduct, getProductStats, getProduct, updateProduct, deleteProduct } from '../controllers/products.controlers';
import { protect, authorize } from '../middlewares/auth.middlewares';
// import { 
//   createProduct, 
//   getProducts, 
//   getProduct, 
//   updateProduct, 
//   deleteProduct,
//   getProductStats
// } from '../controllers/product.controller';
// import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, createProduct);

router
  .route('/stats')
  .get(protect, authorize('admin'), getProductStats);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

export default router;