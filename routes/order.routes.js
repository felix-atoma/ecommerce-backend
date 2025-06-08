import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// CORRECT ORDER:
router.get('/myorders', protect, getUserOrders); // This FIRST
router.get('/:id', protect, getOrderById);      // This SECOND

router.post('/', protect, createOrder);

export default router;