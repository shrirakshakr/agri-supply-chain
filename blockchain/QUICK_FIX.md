# Quick Fix for "no matching fragment" Error

## The Problem
The error "no matching fragment (operation="fragment", code=UNSUPPORTED_OPERATION)" means the contract ABI doesn't match the function call. This happens when:
- Contract was updated but not recompiled
- Old contract is deployed but new code is being used

## Solution - Follow These Steps:

### Step 1: Clean and Recompile Contract
```bash
cd blockchain
npx hardhat clean
npx hardhat compile
```

### Step 2: Start Hardhat Node (if not running)
Open a NEW terminal:
```bash
cd blockchain
npx hardhat node
```
Keep this running. Copy the private key of Account #0.

### Step 3: Deploy New Contract
In another terminal:
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Copy the contract address that's displayed.

### Step 4: Update backend/.env
Make sure your `backend/.env` file has:
```env
PRIVATE_KEY=<paste_private_key_from_hardhat_node_account_0>
CONTRACT_ADDRESS=<paste_new_contract_address>
```

### Step 5: Restart Backend
```bash
cd backend
npm run dev
```

You should see:
- ✅ Blockchain connection initialized
- ✅ Contract address: <your_address>

### Step 6: Test Again
1. Go to Farmer page
2. Fill in the form
3. Submit - should work now!

## If Still Not Working:

1. **Check Hardhat node is running** on http://127.0.0.1:8545
2. **Verify .env file** has correct PRIVATE_KEY and CONTRACT_ADDRESS
3. **Check backend console** for error messages
4. **Ensure contract was deployed** successfully (check deploy script output)

## Common Issues:

### "Contract artifacts not found"
→ Run: `npx hardhat compile`

### "Blockchain not connected"
→ Check Hardhat node is running
→ Verify .env file exists and has correct values

### "Insufficient funds"
→ Hardhat node provides test ETH automatically
→ If issue persists, restart Hardhat node

