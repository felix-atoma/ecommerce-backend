import express from 'express';
import { 
  getCart,
  addToCart, 
  removeFromCart,
  clearCart
} from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; // ✅ Correct

const router = express.Router();

router.route('/')
  .get(protect, getCart)
  .delete(protect, clearCart);

router.route('/items')
  .post(protect, addToCart);

router.route('/items/:productId')
  .delete(protect, removeFromCart);

export default router;