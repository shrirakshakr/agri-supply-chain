const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const Product = require('../models/Product');

const router = express.Router();

// Helpers for distinct-sorted lists limited to entries that were actually linked to blockchain
async function distinctSorted(field, filter = {}) {
	const values = await Product.distinct(field, filter);
	return values
		.filter(v => typeof v === 'string' && v.trim() !== '')
		.map(v => v.trim())
		.sort((a, b) => a.localeCompare(b));
}

function runPythonCheck(payload) {
	return new Promise((resolve, reject) => {
		const scriptPath = path.join(__dirname, '..', 'ml', 'price_model.py');
		const candidates = ['python', 'python3', 'py'];
		let attempted = 0;
		let lastErr = null;
		function tryNext() {
			if (attempted >= candidates.length) {
				return reject(lastErr || new Error('Python not found'));
			}
			const cmd = candidates[attempted++];
			const py = spawn(cmd, [scriptPath, 'check', JSON.stringify(payload)], {
				stdio: ['ignore', 'pipe', 'pipe']
			});
			let out = '';
			let err = '';
			let started = false;
			py.stdout.on('data', (d) => {
				started = true;
				out += d.toString();
			});
			py.stderr.on('data', (d) => (err += d.toString()));
			py.on('error', (e) => {
				lastErr = e;
				tryNext();
			});
			py.on('close', (code) => {
				if (!started && code !== 0) {
					lastErr = new Error(err || `Python exited with ${code}`);
					return tryNext();
				}
				if (code !== 0) {
					return reject(new Error(err || `Python exited with ${code}`));
				}
				try {
					const parsed = JSON.parse(out.trim());
					resolve(parsed);
				} catch (e) {
					reject(new Error('Invalid JSON from Python'));
				}
			});
		}
		tryNext();
	});
}

// POST /api/check-price
router.post('/check-price', async (req, res) => {
	try {
		const { commodity, state, district, market, vendor_price } = req.body;
		if (!commodity || !state || !district || !market || typeof vendor_price === 'undefined') {
			return res.status(400).json({ message: 'Missing required fields' });
		}
		const result = await runPythonCheck({
			commodity,
			state,
			district,
			market,
			vendor_price: Number(vendor_price)
		});

		if (result.status === 'error') {
			return res.status(502).json({ message: result.message });
		}
		return res.status(200).json(result);
	} catch (e) {
		return res.status(500).json({ message: e.message });
	}
});

// POST /api/products (Save verified product for QR flow)
router.post('/products', async (req, res) => {
	try {
		const {
			commodity,
			state,
			district,
			market,
			vendorPrice,
			marketModalPrice,
			status,
			reason,
			submitterName,
			submitterRole,
			submitterId,
			blockchainProductId
		} = req.body;
		if (!commodity || !state || !district || !market || !vendorPrice || !marketModalPrice || !status || !reason) {
			return res.status(400).json({ message: 'Missing required fields' });
		}
		const doc = await Product.create({
			commodity,
			state,
			district,
			market,
			vendorPrice,
			marketModalPrice,
			status,
			reason,
			submitterName: submitterName || '',
			submitterRole: submitterRole || '',
			submitterId: submitterId || '',
			blockchainProductId: blockchainProductId || ''
		});
		return res.status(201).json({ id: doc._id, product: doc });
	} catch (e) {
		return res.status(500).json({ message: e.message });
	}
});

// GET /api/products/:id (Consumer view by QR id)
router.get('/products/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const doc = await Product.findById(id).lean();
		if (!doc) return res.status(404).json({ message: 'Not found' });
		return res.status(200).json(doc);
	} catch (e) {
		return res.status(500).json({ message: e.message });
	}
});

// PATCH /api/products/:id (set blockchainProductId)
router.patch('/products/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { blockchainProductId } = req.body;
		if (!blockchainProductId) {
			return res.status(400).json({ message: 'blockchainProductId is required' });
		}
		const updated = await Product.findByIdAndUpdate(
			id,
			{ $set: { blockchainProductId } },
			{ new: true }
		).lean();
		if (!updated) return res.status(404).json({ message: 'Not found' });
		return res.status(200).json(updated);
	} catch (e) {
		return res.status(500).json({ message: e.message });
	}
});

// ---------------- Vendor options & lookup APIs ----------------
// Only consider records that were added by Farmer and linked on-chain (blockchainProductId present)
// GET /api/options/commodities
router.get('/options/commodities', async (req, res) => {
	try {
		const list = await distinctSorted('commodity', { blockchainProductId: { $ne: '' } });
		return res.status(200).json(list);
	} catch (e) {
		return res.status(500).json({ message: e.message });
	}
});

// GET /api/options/states?commodity=...
router.get('/options/states', async (req, res) => {
	try {
		const { commodity } = req.query;
		if (!commodity) return res.status(400).json({ message: 'commodity is required' });
		const list = await distinctSorted('state', {
			commodity,
			blockchainProductId: { $ne: '' }
		});
		return res.status(200).json(list);
	} catch (e) {
		return res.status(500).json({ message: e.message });
	}
});

// GET /api/options/districts?commodity=...&state=...
router.get('/options/districts', async (req, res) => {
	try {
		const { commodity, state } = req.query;
		if (!commodity || !state) return res.status(400).json({ message: 'commodity and state are required' });
		const list = await distinctSorted('district', {
			commodity,
			state,
			blockchainProductId: { $ne: '' }
		});
		return res.status(200).json(list);
	} catch (e) {
		return res.status(500).json({ message: e.message });
	}
});

// GET /api/options/markets?commodity=...&state=...&district=...
router.get('/options/markets', async (req, res) => {
	try {
		const { commodity, state, district } = req.query;
		if (!commodity || !state || !district) {
			return res.status(400).json({ message: 'commodity, state and district are required' });
		}
		const list = await distinctSorted('market', {
			commodity,
			state,
			district,
			blockchainProductId: { $ne: '' }
		});
		return res.status(200).json(list);
	} catch (e) {
		return res.status(500).json({ message: e.message });
	}
});

// GET /api/products/match?commodity=...&state=...&district=...&market=...
// Returns the product doc linked to chain so UI can grab blockchainProductId
router.get('/products/match', async (req, res) => {
	try {
		const { commodity, state, district, market } = req.query;
		if (!commodity || !state || !district || !market) {
			return res.status(400).json({ message: 'commodity, state, district, market are required' });
		}
		const doc = await Product.findOne({
			commodity,
			state,
			district,
			market,
			blockchainProductId: { $ne: '' }
		}).sort({ updatedAt: -1 }).lean();
		if (!doc) return res.status(404).json({ message: 'No matching product found' });
		return res.status(200).json(doc);
	} catch (e) {
		return res.status(500).json({ message: e.message });
	}
});

module.exports = router;



