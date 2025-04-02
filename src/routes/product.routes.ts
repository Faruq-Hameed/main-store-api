import express from 'express';
import ProductController from '@/controllers/products.controller';
import { Authenticator } from '@/middlewares/auth.middlewares';

const router = express.Router();

router.use(Authenticator)
// Product routes
router.post('/', ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.put('/:id', ProductController.updateProduct);
router.put(':id/status', ProductController.updateProductStatus);
router.get('/:id/history', ProductController.getProductHistories);
router.delete('/:id', ProductController.deleteProduct);

// router.patch('/:id/quantity', ProductController.updateProductQuantity);

export default router;




// import { Router } from 'express';
// import { getProducts, createProduct, getProductStats, getProduct, updateProduct, deleteProduct } from '../controllers/products.controlers';
// import { protect, authorize } from '../middlewares/auth.middlewares';
// // import { 
// //   createProduct, 
// //   getProducts, 
// //   getProduct, 
// //   updateProduct, 
// //   deleteProduct,
// //   getProductStats
// // } from '../controllers/product.controller';
// // import { protect, authorize } from '../middlewares/auth.middleware';

// const router = Router();

// router
//   .route('/')
//   .get(getProducts)
//   .post(protect, createProduct);

// router
//   .route('/stats')
//   .get(protect, authorize('admin'), getProductStats);

// router
//   .route('/:id')
//   .get(getProduct)
//   .put(protect, updateProduct)
//   .delete(protect, deleteProduct);

// export default router;