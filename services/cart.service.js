import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/apiError.js';

const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

const addToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
  }

  await cart.save();
  return await cart.populate('items.product');
};

const removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  await cart.save();
  return await cart.populate('items.product');
};

const clearCart = async (userId) => {
  await Cart.findOneAndDelete({ user: userId });
  return { message: 'Cart cleared' };
};

export { getCart, addToCart, removeFromCart, clearCart };