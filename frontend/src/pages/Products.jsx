import { useRef, useState } from 'react';
import { API_BASE } from '../api';
import { QRCodeCanvas } from 'qrcode.react';
import './Products.css';

function Products() {
  // Search fields for blockchain products
  const [commodity, setCommodity] = useState('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [market, setMarket] = useState('');
  
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const qrCanvasRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setProduct(null);
    setQrUrl('');
    
    if (!commodity || !stateName || !district || !market) {
      setError('Please fill all search fields');
      return;
    }

    setLoading(true);
    try {
      // Search for product on blockchain
      const res = await fetch(`${API_BASE}/products/match?${new URLSearchParams({
        commodity,
        state: stateName,
        district,
        market
      })}`);
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Product not found');
      }

      if (!data.blockchainProductId) {
        throw new Error('Product not found on blockchain');
      }

      // Fetch full product details from blockchain
      const productRes = await fetch(`${API_BASE}/products/product/${data.blockchainProductId}`);
      const productData = await productRes.json();
      
      if (!productRes.ok) {
        throw new Error(productData.error || 'Failed to fetch product details');
      }

      setProduct({
        ...productData,
        blockchainProductId: productData.blockchainProductId || data.blockchainProductId
      });
      // Generate QR code URL pointing to blockchain product ID
      setQrUrl(`${window.location.origin}/product/${data.blockchainProductId}`);
    } catch (err) {
      setError(err.message || 'Failed to search product');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current;
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `product-${product?.blockchainProductId || 'qr'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="products-container">
      <form onSubmit={handleSearch} className="products-form">
        <h2>Search Product by Details</h2>
        <p className="form-subtitle">Enter product details to find and view QR code</p>

        <label>Commodity / Crop Name</label>
        <input
          type="text"
          value={commodity}
          onChange={e => setCommodity(e.target.value)}
          placeholder="e.g., Sweet Pumpkin"
          required
        />

        <label>State</label>
        <input
          type="text"
          value={stateName}
          onChange={e => setStateName(e.target.value)}
          placeholder="e.g., Karnataka"
          required
        />

        <label>District</label>
        <input
          type="text"
          value={district}
          onChange={e => setDistrict(e.target.value)}
          placeholder="e.g., Bangalore"
          required
        />

        <label>Market</label>
        <input
          type="text"
          value={market}
          onChange={e => setMarket(e.target.value)}
          placeholder="e.g., Ramanagara"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Product'}
        </button>

        {error && <p className="error-message">❌ {error}</p>}
      </form>

      {product && (
        <div className="product-result">
          <h3>Product Found</h3>
          <div className="product-info">
            <p><strong>Product ID:</strong> {product.blockchainProductId || 'N/A'}</p>
            <p><strong>Crop/Commodity:</strong> {product.name}</p>
            <p><strong>Base Price:</strong> ₹{product.basePrice}</p>
            <p><strong>State:</strong> {product.state}</p>
            <p><strong>District:</strong> {product.district}</p>
            <p><strong>Market:</strong> {product.market}</p>
            {product.priceTrail && product.priceTrail.length > 0 && (
              <p><strong>Latest Vendor Price:</strong> ₹{product.priceTrail[product.priceTrail.length - 1]}</p>
            )}
          </div>

          {qrUrl && (
            <div className="qr-section">
              <p>📦 Product QR Code:</p>
              <QRCodeCanvas value={qrUrl} size={200} ref={qrCanvasRef} />
              <button className="qr-download-btn" onClick={handleDownloadQR}>
                ⬇️ Download QR Code
              </button>
              <p className="qr-note">Scan this QR code or download it for sharing</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Products;
