const express = require('express');
const router = express.Router();

const User = require('../models/User');

// Hardcoded admin credentials
const ADMIN_PHONE = '9999999999';
const ADMIN_UNIQUE_ID = 'ADMIN12345';

function formatAgriId(n) {
	const numberPart = String(n).padStart(5, '0');
	return `AGRI${numberPart}`;
}

// POST /api/register
router.post('/register', async (req, res) => {
	try {
		const {
			firstName,
			middleName,
			lastName,
			phoneNumber,
			addressLine1,
			addressLine2,
			district,
			state,
			country,
			userType
		} = req.body;

		if (!firstName || !lastName || !phoneNumber || !addressLine1 || !district || !state || !country || !userType) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		if (!['Farmer', 'Vendor', 'Consumer'].includes(userType)) {
			return res.status(400).json({ message: 'Invalid userType' });
		}

		const total = await User.countDocuments();
		const nextNum = total + 1;
		const uniqueId = formatAgriId(nextNum);

		const user = await User.create({
			firstName,
			middleName: middleName || '',
			lastName,
			phoneNumber,
			addressLine1,
			addressLine2: addressLine2 || '',
			district,
			state,
			country,
			userType,
			uniqueId
		});

		return res.status(201).json({
			message: 'Registration successful',
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				phoneNumber: user.phoneNumber,
				userType: user.userType,
				uniqueId: user.uniqueId,
				createdAt: user.createdAt
			}
		});
	} catch (err) {
		if (err.code === 11000) {
			return res.status(409).json({ message: 'Unique ID conflict, please retry' });
		}
		return res.status(500).json({ message: 'Server error', error: err.message });
	}
});

// POST /api/login
router.post('/login', async (req, res) => {
	try {
		const { phoneNumber, uniqueId } = req.body;

		if (!phoneNumber || !uniqueId) {
			return res.status(400).json({ message: 'Phone number and Unique ID are required' });
		}

		// Admin shortcut
		if (phoneNumber === ADMIN_PHONE && uniqueId === ADMIN_UNIQUE_ID) {
			return res.status(200).json({
				message: 'Login successful',
				user: {
					firstName: 'Admin',
					lastName: 'User',
					phoneNumber,
					userType: 'Admin',
					uniqueId
				}
			});
		}

		const user = await User.findOne({ phoneNumber, uniqueId }).lean();
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		return res.status(200).json({
			message: 'Login successful',
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				phoneNumber: user.phoneNumber,
				userType: user.userType,
				uniqueId: user.uniqueId
			}
		});
	} catch (err) {
		return res.status(500).json({ message: 'Server error', error: err.message });
	}
});

// GET /api/users  (Admin only)
router.get('/users', async (req, res) => {
	try {
		const { phoneNumber, uniqueId } = req.query;

		// naive auth gate for admin
		if (!(phoneNumber === ADMIN_PHONE && uniqueId === ADMIN_UNIQUE_ID)) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const users = await User.find().sort({ createdAt: -1 }).lean();
		return res.status(200).json(users);
	} catch (err) {
		return res.status(500).json({ message: 'Server error', error: err.message });
	}
});

// DELETE /api/users/:id  (Admin only)
router.delete('/users/:id', async (req, res) => {
	try {
		const { phoneNumber, uniqueId } = req.query;

		if (!(phoneNumber === ADMIN_PHONE && uniqueId === ADMIN_UNIQUE_ID)) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const { id } = req.params;
		await User.findByIdAndDelete(id);
		return res.status(200).json({ message: 'User deleted' });
	} catch (err) {
		return res.status(500).json({ message: 'Server error', error: err.message });
	}
});

module.exports = router;


