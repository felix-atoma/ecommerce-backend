import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import ApiError from '../utils/apiError.js';
import stripe from 'stripe';

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

const createOrder = async (userId, orderData) => {
  const { 
    shippingInfo,
    paymentMethod,
    eMoneyNumber,
    eMoneyPIN 
  } = orderData;

  // Get and validate cart
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'No items in cart');
  }

  // Calculate order totals
  const itemsPrice = cart.items.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );
  const taxPrice = itemsPrice * 0.2;
  const shippingPrice = 50;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Process payment if e-money
  let paymentResult;
  if (paymentMethod === 'e-money') {
    paymentResult = await stripeClient.paymentIntents.create({
      amount: totalPrice * 100,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { userId: userId.toString() },
    });
  }

  // Create order
  const order = await Order.create({
    user: userId,
    shippingInfo,
    paymentMethod,
    paymentResult: paymentResult ? {
      id: paymentResult.id,
      status: paymentResult.status,
    } : undefined,
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
    isPaid: paymentMethod !== 'cash',
    paidAt: paymentMethod !== 'cash' ? Date.now() : undefined,
  });

  // Clear cart
  await Cart.findOneAndDelete({ user: userId });

  return order;
};

const getOrderById = async (orderId, userId) => {
  const order = await Order.findById(orderId).populate('user', 'name email');
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Verify ownership
  if (order.user._id.toString() !== userId.toString()) {
    throw new ApiError(401, 'Not authorized to access this order');
  }

  return order;
};

const getUserOrders = async (userId) => {
  return await Order.find({ user: userId });
};

export { createOrder, getOrderById, getUserOrders };