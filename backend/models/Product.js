const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
	{
		commodity: { type: String, required: true },
		state: { type: String, required: true },
		district: { type: String, required: true },
		market: { type: String, required: true },
		vendorPrice: { type: Number, required: true },
		marketModalPrice: { type: Number, required: true },
		status: { type: String, enum: ['accept', 'reject'], required: true },
		reason: { type: String, required: true },

		// Who submitted/updated
		submitterName: { type: String, default: '' },
		submitterRole: { type: String, enum: ['Farmer', 'Vendor', 'Admin', ''], default: '' },
		submitterId: { type: String, default: '' }, // uniqueId or user._id

		// Optional link to blockchain product id (numeric string)
		blockchainProductId: { type: String, default: '' }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);


