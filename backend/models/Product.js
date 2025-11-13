const mongoose = require('mongoose');

// MongoDB only stores QR code mapping to blockchain transaction
const ProductSchema = new mongoose.Schema(
	{
		// Blockchain product ID (from smart contract)
		blockchainProductId: { type: String, required: true, unique: true, index: true },
		
		// Transaction hash from blockchain
		txHash: { type: String, required: true },
		
		// QR code URL (for consumer scanning)
		qrCodeUrl: { type: String, required: true },
		
		// Optional metadata for ML verification (not used for display)
		mlVerificationStatus: { type: String, enum: ['accept', 'reject'], default: '' },
		mlReason: { type: String, default: '' },
		marketModalPrice: { type: Number, default: 0 }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);


