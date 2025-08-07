const express = require("express");
const router = express.Router();
const contract = require("../blockchain"); // ✅ Blockchain contract

// 🧑‍🌾 Add Product (Farmer)
// productRoutes.js

// 🧑‍🌾 Add Product (Farmer)
// 🧑‍🌾 Add Product (Farmer)
router.post("/farmer/add-product", async (req, res) => {
    const { name, basePrice } = req.body;

    try {
        const tx = await contract.addProduct(name, basePrice);
        await tx.wait();

        // 🔁 Get current productCount (latest ID)
        const productCount = await contract.productCount();

        res.status(200).json({
            message: "✅ Product added to blockchain.",
            productId: productCount.toString(),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// 🧑‍💼 Update Price (Vendor)
// 🧑‍💼 Update Price (Vendor)
router.post("/vendor/update-price", async (req, res) => {
    const { productId, newPrice } = req.body;

    try {
        const tx = await contract.updatePrice(productId, newPrice);
        const receipt = await tx.wait();

        res.status(200).json({
            message: "✅ Price updated on blockchain.",
            txHash: receipt.hash
        });
    } catch (error) {
        console.error("❌ Error updating price:", error);
        res.status(500).json({ error: error.message });
    }
});



// 📦 Get Product by ID (for history or display)
router.get("/product/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const product = await contract.getProduct(id);

        const formatted = {
            name: product[0],
            basePrice: product[1].toString(),
            farmer: product[2],
            priceTrail: product[3].map(p => p.toString()),
            handlers: product[4]
        };

        res.status(200).json(formatted);
    } catch (error) {
        console.error("❌ Error fetching product:", error);
        res.status(500).json({ error: error.message });
    }
});




module.exports = router;
