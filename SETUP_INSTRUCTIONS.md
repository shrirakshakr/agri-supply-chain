# Setup Instructions - Blockchain Agriculture Supply Chain

## Prerequisites
- Node.js installed
- MongoDB running (local or cloud)
- Hardhat installed globally (or use npx)

## Step 1: Compile and Deploy Smart Contract

### 1.1 Start Hardhat Node
Open a terminal and run:
```bash
cd blockchain
npx hardhat node
```
Keep this terminal running. It will show accounts with private keys.

### 1.2 Compile Contract
Open a NEW terminal:
```bash
cd blockchain
npx hardhat compile
```

### 1.3 Deploy Contract
In the same terminal:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will output:
- Contract address (copy this)
- Deployer address
- Instructions for .env file

### 1.4 Get Private Key
From the Hardhat node terminal, copy the private key of Account #0 (the deployer).

## Step 2: Configure Backend

### 2.1 Create backend/.env file
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/agri-supply-chain
MONGO_DB=agri-supply-chain
PRIVATE_KEY=<paste_private_key_from_hardhat_node>
CONTRACT_ADDRESS=<paste_contract_address_from_deployment>
```

### 2.2 Install Dependencies
```bash
cd backend
npm install
```

### 2.3 Start Backend
```bash
npm run dev
```

You should see:
- ✅ Connected to MongoDB
- ✅ Blockchain connection initialized
- Server running on http://localhost:3000

## Step 3: Configure Frontend

### 3.1 Install Dependencies
```bash
cd frontend
npm install
```

### 3.2 Start Frontend
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Step 4: Test the System

### 4.1 Register a User
1. Go to http://localhost:5173/register
2. Fill in details and select "Farmer"
3. Note your AGRI ID

### 4.2 Login
1. Go to http://localhost:5173/login
2. Enter phone number and AGRI ID

### 4.3 Add Product (Farmer)
1. Go to Farmer page
2. Fill in:
   - Commodity/Crop Name: Sweet Pumpkin
   - Base Price: 1400
   - State: Karnataka
   - District: Bangalore
   - Market: Ramanagara
3. Click Submit
4. Should see success message and QR code

### 4.4 Search Product
1. Go to Products page
2. Enter the same details
3. Click "Search Product"
4. Should see product details and QR code

## Troubleshooting

### Error: "no matching fragment" or "UNSUPPORTED_OPERATION"
**Solution:** Contract not recompiled. Run:
```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```
Update CONTRACT_ADDRESS in backend/.env

### Error: "Blockchain not connected"
**Solution:** 
1. Ensure Hardhat node is running
2. Check PRIVATE_KEY and CONTRACT_ADDRESS in backend/.env
3. Verify contract was deployed successfully

### Error: "Cannot connect to blockchain"
**Solution:**
1. Check Hardhat node is running on http://127.0.0.1:8545
2. Verify .env file has correct values
3. Restart backend server

### Error: "Contract artifacts not found"
**Solution:** Run:
```bash
cd blockchain
npx hardhat compile
```

## Important Notes

- **Keep Hardhat node running** while using the application
- **Recompile contract** after any changes to ProductSupplyChain.sol
- **Redeploy contract** after recompiling (old deployments won't work)
- **Update CONTRACT_ADDRESS** in .env after each deployment

