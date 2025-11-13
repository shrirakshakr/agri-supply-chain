// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ProductSupplyChain contract...");
  
  const SupplyChain = await hre.ethers.getContractFactory("ProductSupplyChain");
  const contract = await SupplyChain.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contract deployed to:", address);
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);
  
  // Get the private key (for .env file)
  console.log("\n📋 Add these to your backend/.env file:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log(`PRIVATE_KEY=<your_account_private_key>`);
  console.log("\n💡 To get private keys, check Hardhat accounts or use:");
  console.log("   npx hardhat node --show-accounts");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
