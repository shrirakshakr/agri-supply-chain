import { useEffect, useState } from 'react';
import './Vendor.css';

function Vendor() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [vendorPrice, setVendorPrice] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Fetch all products
    fetch('http://localhost:3000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`http://localhost:3000/api/products/${selectedId}/addPrice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorPrice }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccessMsg(`✅ ${data.message}`);
      setVendorPrice('');
    } else {
      setSuccessMsg('❌ Failed to update price.');
    }
  };

  return (
    <div className="vendor-container">
      <form onSubmit={handleSubmit} className="vendor-form">
        <h2>Vendor: Update Crop Price</h2>

        <label>Select Crop</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
          <option value="">-- Select --</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (Base: ₹{p.basePrice})
            </option>
          ))}
        </select>

        <label>Vendor Price (₹)</label>
        <input
          type="number"
          value={vendorPrice}
          onChange={(e) => setVendorPrice(e.target.value)}
          required
        />

        <button type="submit">Submit Price</button>

        {successMsg && <p className="success-message">{successMsg}</p>}
      </form>
    </div>
  );
}

export default Vendor;
