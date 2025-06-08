import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import cartRoutes from './routes/cart.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import config from './config/config.js';

const app = express();

// Parse allowed origins from comma-separated list
const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(',').map(u => u.trim())
  : [config.clientUrl]; // fallback to single CLIENT_URL

app.use(cors({
  origin: (origin, callback) => {
    // allow requests without origin (e.g., curl, mobile app)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser(config.jwtSecret));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// Root health check endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the E-commerce API');
});

app.use(errorMiddleware);

export default app;
