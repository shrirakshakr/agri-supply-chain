// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const SupplyChain = await hre.ethers.getContractFactory("ProductSupplyChain");
  const contract = await SupplyChain.deploy();
  await contract.waitForDeployment();

  console.log("✅ Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
