const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://your-app-name.vercel.app'   // ← paste your actual Vercel URL
]

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json());

// Routes
app.use('/api/users',        require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/goals',        require('./routes/goalRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;