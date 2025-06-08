import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import stripe from 'stripe';

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

const createOrder = asyncHandler(async (req, res) => {
  const { 
    shippingInfo,
    paymentMethod,
    eMoneyNumber,
    eMoneyPIN 
  } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'No items in cart');
  }

  // Calculate order totals
  const itemsPrice = cart.items.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );
  const taxPrice = itemsPrice * 0.2; // 20% VAT
  const shippingPrice = 50; // Flat shipping rate
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Create payment intent if using e-money
  let paymentIntent;
  if (paymentMethod === 'e-money') {
    paymentIntent = await stripeClient.paymentIntents.create({
      amount: totalPrice * 100,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        userId: req.user.id.toString(),
      },
    });
  }

  // Create order
  const order = await Order.create({
    user: req.user.id,
    shippingInfo,
    paymentMethod,
    paymentResult: paymentIntent
      ? {
          id: paymentIntent.id,
          status: paymentIntent.status,
        }
      : undefined,
    items: cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.image,
    })),
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: paymentMethod === 'cash' ? false : true,
    paidAt: paymentMethod === 'cash' ? undefined : Date.now(),
  });

  // Clear cart
  await Cart.findOneAndDelete({ user: req.user.id });

  new ApiResponse(201, { order }, 'Order created successfully').send(res);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(401, 'Not authorized to access this order');
  }

  new ApiResponse(200, { order }, 'Order retrieved successfully').send(res);
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id });
  new ApiResponse(200, { orders }, 'User orders retrieved').send(res);
});

export { createOrder, getOrderById, getUserOrders };