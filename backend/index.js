const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors()); // ✅ This allows frontend to connect
app.use(express.json());
app.use('/api/products', productRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
