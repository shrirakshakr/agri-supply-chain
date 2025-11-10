const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	firstName: { type: String, required: true, trim: true },
	middleName: { type: String, trim: true },
	lastName: { type: String, required: true, trim: true },
	phoneNumber: { type: String, required: true, trim: true },
	addressLine1: { type: String, required: true, trim: true },
	addressLine2: { type: String, trim: true },
	district: { type: String, required: true, trim: true },
	state: { type: String, required: true, trim: true },
	country: { type: String, required: true, trim: true },
	userType: { type: String, required: true, enum: ['Farmer', 'Vendor', 'Consumer'] },
	uniqueId: { type: String, required: true, unique: true, index: true },
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);


