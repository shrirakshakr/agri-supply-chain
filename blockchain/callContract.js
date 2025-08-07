require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// Load ABI
const abi = JSON.parse(
  fs.readFileSync("./artifacts/contracts/ProductSupplyChain.sol/ProductSupplyChain.json")
).abi;

// Connect to local Hardhat node
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Use the first Hardhat account (private key is public in dev mode)
const signer = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);

// Create contract instance
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  signer
);

// Add a product
async function addProduct() {
  const tx = await contract.addProduct("Wheat", 1500);
  await tx.wait();
  console.log("✅ Product added successfully!");
}

addProduct().catch((err) => console.error("❌ Error:", err));
