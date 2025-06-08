import app from './app.js';
import connectDB from './config/db.js';
import config from './config/config.js';

const startServer = async () => {
  try {
    await connectDB();

    // 1. Root health check route
    app.get('/', (req, res) => {
      res.send('API is running!');
    });

    const server = app.listen(config.port, () => {
      console.log(`Server running in ${config.env} mode on port ${config.port}`);
    });

    process.on('unhandledRejection', err => {
      console.log('UNHANDLED REJECTION! Shutting down...');
      console.log(err.name, err.message);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', err => {
      console.log('UNCAUGHT EXCEPTION! Shutting down...');
      console.log(err.name, err.message);
      process.exit(1);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
