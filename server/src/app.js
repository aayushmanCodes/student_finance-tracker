const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users',        require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/goals',        require('./routes/goalRoutes'));

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;