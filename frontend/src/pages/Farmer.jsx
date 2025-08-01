import { useState } from 'react';
import './Farmer.css';

function Farmer() {
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:3000/api/products/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, basePrice }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccessMsg(`✅ ${data.message}`);
      setName('');
      setBasePrice('');
    } else {
      setSuccessMsg('❌ Failed to add crop.');
    }
  };

  return (
    <div className="farmer-container">
      <form onSubmit={handleSubmit} className="farmer-form">
        <h2>Upload Crop</h2>

        <label>Crop Name</label>
        <input
          type="text"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />

        <label>Base Price (₹)</label>
        <input
          type="number"
          value={basePrice}
          required
          onChange={(e) => setBasePrice(e.target.value)}
        />

        <button type="submit">Submit</button>

        {successMsg && <p className="success-message">{successMsg}</p>}
      </form>
    </div>
  );
}

export default Farmer;
