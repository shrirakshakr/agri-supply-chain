require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

let contract = null;
let provider = null;
let wallet = null;

function initializeBlockchain() {
    try {
        // Check if contract artifacts exist
        const contractPath = path.join(__dirname, "..", "blockchain", "artifacts", "contracts", "ProductSupplyChain.sol", "ProductSupplyChain.json");
        if (!fs.existsSync(contractPath)) {
            console.error("❌ Contract artifacts not found. Please compile the contract first.");
            console.error("   Run: cd blockchain && npx hardhat compile");
            return null;
        }

        const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
        const abi = contractJson.abi;

        // Validate ABI has the correct addProduct function signature
        const addProductFunction = abi.find(
            (item) => item.type === "function" && 
            item.name === "addProduct" && 
            item.inputs && 
            item.inputs.length === 5
        );
        
        if (!addProductFunction) {
            console.error("❌ Contract ABI mismatch! The addProduct function signature doesn't match.");
            console.error("   Expected: addProduct(string, uint256, string, string, string)");
            console.error("   Please recompile the contract: cd blockchain && npx hardhat compile");
            return null;
        }

        // Check environment variables
        if (!process.env.PRIVATE_KEY) {
            console.error("❌ PRIVATE_KEY not set in .env file");
            return null;
        }

        if (!process.env.CONTRACT_ADDRESS) {
            console.error("❌ CONTRACT_ADDRESS not set in .env file");
            return null;
        }

        // Connect to local Hardhat node
        provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

        console.log("✅ Blockchain connection initialized");
        console.log("   Contract address:", process.env.CONTRACT_ADDRESS);
        console.log("   Network: Hardhat localhost");
        console.log("   ⚠️  Note: If you get 'no matching fragment' error, the deployed contract");
        console.log("      doesn't match the ABI. Redeploy: cd blockchain && npx hardhat run scripts/deploy.js --network localhost");
        return contract;
    } catch (error) {
        console.error("❌ Failed to initialize blockchain:", error.message);
        if (error.message.includes("network") || error.message.includes("connection")) {
            console.error("   Please ensure Hardhat node is running: cd blockchain && npx hardhat node");
        }
        return null;
    }
}

// Initialize on module load
contract = initializeBlockchain();

// Wrapper to check connection before operations
function getContract() {
    if (!contract) {
        throw new Error("Blockchain not connected. Please ensure Hardhat node is running and contract is deployed.");
    }
    return contract;
}

module.exports = new Proxy({}, {
    get(target, prop) {
        const contractInstance = getContract();
        return contractInstance[prop];
    }
});
