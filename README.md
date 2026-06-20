Overview : 
This project is a blockchain-powered agricultural supply chain management system designed to improve transparency in crop pricing and reduce fraudulent price manipulation by intermediaries. The system records every price update of a product on a private Ethereum blockchain and uses machine learning to validate whether a vendor's price increase is justified based on real-time market prices obtained from the Agmarknet API. Consumers can scan a QR code attached to the product and view its complete pricing history from farmer to vendor, ensuring transparency throughout the supply chain.

Problem Statement :
In traditional agricultural supply chains, products pass through multiple intermediaries before reaching consumers. During this process, prices can be increased without valid justification, making it difficult for farmers and consumers to track pricing transparency.
This project addresses this issue by:
- Recording product transactions on an immutable blockchain.
- Comparing vendor prices with real-time market data.
- Providing consumers with a transparent product journey through QR codes.

Features : 
Blockchain-Based Traceability ->
- Stores product and pricing information on a private Ethereum blockchain.
- Maintains an immutable transaction history.
AI-Powered Price Verification ->
- Uses an Isolation Forest machine learning model.
- Detects abnormal price increases.
- Validates vendor prices against real-time market prices.
Real-Time Market Integration ->
- Fetches agricultural commodity prices from the Agmarknet API.
- Uses market modal prices for validation.
QR Code Tracking ->
- Generates QR codes for products.
- Allows consumers to view complete pricing history.
Role-Based Supply Chain Flow ->
- Farmer uploads crop details.
- Vendor purchases and updates pricing.
- Consumer verifies product information.

System Architecture : 
Farmer
   ↓
Frontend (React)
   ↓
Backend (Node.js / Express)
   ↓
ML Verification Service (Python)
   ↓
Agmarknet API
   ↓
Blockchain (Ethereum / Hardhat)
   ↓
MongoDB
   ↓
QR Code Generation
   ↓
Consumer

Tech Stack :
Frontend ->
- React.js
- Vite
- Bootstrap
Backend ->
- Node.js
- Express.js
Database ->
- MongoDB
Blockchain ->
- Solidity
- Hardhat
- Ethers.js
Machine Learning ->
- Python
- Scikit-Learn
- Isolation Forest
External API ->
- Agmarknet Market Price API

Workflow :
1. Farmer Registration - Farmers enter crop details and initial selling price.
2. Product Creation - Product information is stored on the blockchain.
3. Vendor Price Update - Vendors purchase products and submit updated prices.
4. Price Validation(The system) - Fetches current market prices, runs anomaly detection using Isolation Forest, accepts or rejects suspicious price hikes.
5. Blockchain Storage - Approved transactions are permanently recorded on the blockchain.
6. Consumer Verification - Consumers scan a QR code to view the complete product pricing journey.

Machine Learning Approach :
The project uses the Isolation Forest algorithm to identify abnormal pricing behavior.
Features Used ->
- Modal Price
- Minimum Price
- Maximum Price
- Price Range
- Price Spread
