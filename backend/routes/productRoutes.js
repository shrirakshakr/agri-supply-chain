const express = require('express');
const router = express.Router();

// Temporary in-memory product list
let products = [];

// ✅ 1. Add Product (Farmer)
router.post('/add', (req, res) => {
    const { name, basePrice } = req.body;

    const newProduct = {
        id: products.length + 1,
        name,
        basePrice,
        vendorPrices: [],
        createdAt: new Date()
    };

    products.push(newProduct);

    res.status(201).json({
        message: 'Product added successfully',
        data: newProduct
    });
});

// ✅ 2. Get All Products (for Vendor dropdown)
router.get('/', (req, res) => {
    res.json(products);
});

// ✅ 3. Add Vendor Price to Product
router.post('/:id/addPrice', (req, res) => {
    const { id } = req.params;
    const { vendorPrice } = req.body;

    const product = products.find(p => p.id === parseInt(id));
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure vendorPrices array exists
    if (!Array.isArray(product.vendorPrices)) {
        product.vendorPrices = [];
    }

    // Add vendor price with timestamp
    product.vendorPrices.push({
        price: vendorPrice,
        updatedAt: new Date()
    });

    res.json({
        message: 'Vendor price updated successfully',
        product
    });
});

// ✅ 4. Get Product by ID (for Price History Viewer)
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const product = products.find(p => p.id === parseInt(id));

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
});

module.exports = router;
