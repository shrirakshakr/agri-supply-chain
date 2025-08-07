import { useState, useRef } from 'react';
import './Farmer.css';
import { QRCodeCanvas } from 'qrcode.react';

function Farmer() {
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [productId, setProductId] = useState(null);
  const qrRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/products/farmer/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, basePrice }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`✅ ${data.message}`);
        setProductId(data.productId); // <-- coming from blockchain route
        setName('');
        setBasePrice('');
      } else {
        setSuccessMsg(`❌ ${data.error || 'Failed to add product.'}`);
      }
    } catch (error) {
      console.error(error);
      setSuccessMsg('❌ Server error. Please try again.');
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `crop-${productId}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {productId && (
        <div className="qr-section" ref={qrRef}>
          <p>📦 Crop QR Code (for scanning later):</p>
          <QRCodeCanvas
            value={`http://localhost:5173/product/${productId}`}
            size={180}
          />
          <br />
          <button onClick={handleDownloadQR} style={{ marginTop: '10px' }}>
            ⬇️ Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}

export default Farmer;
