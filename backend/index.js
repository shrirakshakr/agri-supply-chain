// index.js
const express = require('express');
const app = express();
const productRoutes = require('./routes/productRoutes');

app.use(express.json());

// Use routes
app.use('/api/products', productRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
