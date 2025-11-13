# Fix "no matching fragment" Error - Step by Step

## The Problem
The error "no matching fragment (code=UNSUPPORTED_OPERATION)" means the **deployed contract** doesn't match the **compiled ABI**. 

This happens when:
- Contract code was updated
- Contract was recompiled ✅
- But contract was NOT redeployed ❌
- Backend is using old contract address

## Solution - Redeploy Contract

### Step 1: Start Hardhat Node
Open Terminal 1:
```bash
cd blockchain
npx hardhat node
```
**Keep this running!** You'll see accounts with private keys. Copy Account #0's private key.

### Step 2: Deploy New Contract
Open Terminal 2:
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

You'll see output like:
```
✅ Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
📝 Deployer address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### Step 3: Update backend/.env
Edit `backend/.env` file:
```env
PRIVATE_KEY=<paste_private_key_from_terminal_1_account_0>
CONTRACT_ADDRESS=<paste_contract_address_from_terminal_2>
```

### Step 4: Restart Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ Blockchain connection initialized
   Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   Network: Hardhat localhost
```

### Step 5: Test
1. Go to Farmer page
2. Fill form and submit
3. Should work now! ✅

## Verify Contract is Correct

You can verify the deployed contract has correct function:
```bash
cd blockchain
node scripts/verify-deployment.js <contract_address>
```

## Important Notes

- **Every time you change the contract**, you must:
  1. Recompile: `npx hardhat compile`
  2. Redeploy: `npx hardhat run scripts/deploy.js --network localhost`
  3. Update `CONTRACT_ADDRESS` in `backend/.env`
  4. Restart backend

- **Keep Hardhat node running** while using the app

- **Old deployments won't work** with new ABI - always redeploy after contract changes

