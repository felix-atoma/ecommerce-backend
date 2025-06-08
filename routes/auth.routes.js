import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
} from '../controllers/auth.controller.js';
import validate from '../validations/auth.validation.js';
import { protect } from '../middlewares/auth.middleware.js';  // ✅ Correct (named import)

const router = express.Router();

router.post('/register', validate('register'), register);
router.post('/login', validate('login'), login);
router.get('/logout', logout);
router.get('/me', protect, getCurrentUser);

export default router;
