const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const priceRoutes = require('./routes/priceRoutes');

const app = express();

app.use(cors()); // ✅ This allows frontend to connect
app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api', authRoutes);
app.use('/api', priceRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set. Please configure your MongoDB connection string in .env');
    } else {
      await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || undefined });
      console.log('✅ Connected to MongoDB');
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
