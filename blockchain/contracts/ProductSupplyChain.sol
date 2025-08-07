// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductSupplyChain {

    struct Product {
        string name;
        uint256 basePrice;
        address farmer;
        uint256[] priceTrail;
        address[] handlers;
    }

    mapping(uint256 => Product) public products;
    uint256 public productCount;

    // ✅ Event to emit when product is added
    event ProductAdded(uint256 productId, string name);

    // 🧑‍🌾 Add product by farmer
    function addProduct(string memory name, uint256 basePrice) public {
        productCount++; // Increment first, so first product gets ID = 1

        // Create empty arrays
        uint256[] memory emptyPrices;
        address[] memory emptyHandlers;

        products[productCount] = Product({
            name: name,
            basePrice: basePrice,
            farmer: msg.sender,
            priceTrail: emptyPrices,
            handlers: emptyHandlers
        });

        // ✅ Emit event with product ID
        emit ProductAdded(productCount, name);
    }

    // 🧑‍💼 Vendor adds a new price entry
    function updatePrice(uint256 productId, uint256 newPrice) public {
        require(productId > 0 && productId <= productCount, "Invalid product ID");
        products[productId].priceTrail.push(newPrice);
        products[productId].handlers.push(msg.sender);
    }

    // 📦 Get product details
    function getProduct(uint256 productId) public view returns (
        string memory,
        uint256,
        address,
        uint256[] memory,
        address[] memory
    ) {
        require(productId > 0 && productId <= productCount, "Invalid product ID");
        Product memory p = products[productId];
        return (p.name, p.basePrice, p.farmer, p.priceTrail, p.handlers);
    }
}
