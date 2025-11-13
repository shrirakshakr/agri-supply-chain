// scripts/verify-deployment.js
const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || process.argv[2];
  
  if (!contractAddress) {
    console.error("❌ Please provide contract address:");
    console.error("   node scripts/verify-deployment.js <contract_address>");
    console.error("   or set CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  console.log("🔍 Verifying contract at:", contractAddress);
  
  try {
    const contract = await hre.ethers.getContractAt("ProductSupplyChain", contractAddress);
    
    // Try to get productCount (should work if contract is valid)
    const count = await contract.productCount();
    console.log("✅ Contract is valid!");
    console.log("   Current product count:", count.toString());
    
    // Try to check if addProduct has correct signature by checking ABI
    const abi = contract.interface.fragments;
    const addProductFragment = abi.find(f => f.name === "addProduct");
    
    if (addProductFragment) {
      const inputs = addProductFragment.inputs;
      console.log("✅ addProduct function found");
      console.log("   Parameters:", inputs.length);
      inputs.forEach((input, i) => {
        console.log(`   ${i + 1}. ${input.name}: ${input.type}`);
      });
      
      if (inputs.length === 5) {
        console.log("✅ Function signature matches expected format!");
      } else {
        console.error("❌ Function signature mismatch!");
        console.error("   Expected 5 parameters, found:", inputs.length);
        console.error("   Please redeploy the contract.");
      }
    } else {
      console.error("❌ addProduct function not found in contract!");
    }
    
  } catch (error) {
    console.error("❌ Error verifying contract:", error.message);
    if (error.message.includes("invalid address")) {
      console.error("   The contract address is invalid.");
    } else if (error.message.includes("call revert")) {
      console.error("   Contract exists but may have wrong ABI or be at wrong address.");
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

