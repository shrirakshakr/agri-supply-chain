// routes/productRoutes.js
const express = require('express');
const router = express.Router();

// Example product structure (will replace with blockchain later)
let products = [];

// POST /api/products/add
router.post('/add', (req, res) => {
    const { name, basePrice } = req.body;

    const newProduct = {
        id: products.length + 1,
        name,
        basePrice,
        createdAt: new Date()
    };

    products.push(newProduct);

    res.status(201).json({
        message: 'Product added successfully',
        data: newProduct
    });
});

module.exports = router;
