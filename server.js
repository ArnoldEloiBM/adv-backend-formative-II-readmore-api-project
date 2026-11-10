
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

const authorRoutes = require('./routes/authorRoutes');
const bookRoutes = require('./routes/bookRoutes');

app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to ReadMore API!'
  });
});

// Connecting to MongoDB before starting the server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`ReadMore API running on port ${PORT}: http://localhost:${PORT}/`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
