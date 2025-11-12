import { useMemo, useRef, useState } from 'react';
import './Farmer.css';
import { QRCodeCanvas } from 'qrcode.react';
import { API_BASE } from '../api';

function Farmer() {
  // Single field for Crop/Commodity name as requested
  const [cropCommodity, setCropCommodity] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [productId, setProductId] = useState(null);
  const qrRef = useRef();

  // Location fields entered manually (no dropdowns)
  const [commodity, setCommodity] = useState('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [market, setMarket] = useState('');
  const [mlResult, setMlResult] = useState(null);
  const [qrDbId, setQrDbId] = useState('');

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('agri_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Keep commodity and crop name the same
  // Ensure we mirror this to commodity for ML/DB, and to name for blockchain
  const handleCropCommodityChange = (val) => {
    setCropCommodity(val);
    setCommodity(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSuccessMsg('');
      setProductId(null);
      setMlResult(null);
      setQrDbId('');

      // Basic client-side validation
      const cc = String(cropCommodity || '').trim();
      const st = String(stateName || '').trim();
      const dt = String(district || '').trim();
      const mk = String(market || '').trim();
      const bpNum = Number(basePrice);
      if (!cc || !st || !dt || !mk || !Number.isFinite(bpNum) || bpNum <= 0) {
        setSuccessMsg('❌ Please fill all fields correctly (price must be > 0).');
        return;
      }

      // First: ML price check using vendor price as basePrice here
      const checkRes = await fetch(`${API_BASE}/check-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: cc,
          state: st,
          district: dt,
          market: mk,
          vendor_price: bpNum
        })
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok) {
        setSuccessMsg(`❌ ${checkData?.message || 'Price verification failed.'}`);
        return;
      }
      setMlResult(checkData);
      if (checkData.status !== 'accept') {
        setSuccessMsg(`❌ ${checkData.reason || 'Rejected by model/business rule'}`);
        return;
      }

      // Save metadata for QR
      const saveRes = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: cc,
          state: st,
          district: dt,
          market: mk,
          vendorPrice: bpNum,
          marketModalPrice: checkData.market_modal_price,
          status: checkData.status,
          reason: checkData.reason,
          submitterName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
          submitterRole: user?.userType || '',
          submitterId: user?.uniqueId || ''
        })
      });
      const saved = await saveRes.json();
      if (!saveRes.ok) {
        setSuccessMsg(`❌ ${saved?.message || 'Failed to save product metadata.'}`);
        return;
      }
      if (saveRes.ok) {
        setQrDbId(saved.id);
      }

      // Proceed to blockchain add product - use cropCommodity as name
      const response = await fetch('http://localhost:3000/api/products/farmer/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cc, basePrice: bpNum }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`✅ ${data.message}`);
        setProductId(data.productId); // <-- coming from blockchain route
        setCropCommodity('');
        setBasePrice('');
        setCommodity('');
        setStateName('');
        setDistrict('');
        setMarket('');

        // Attach blockchainProductId to previously saved DB record (if any)
        try {
          if (saved?.id && data.productId) {
            await fetch(`${API_BASE}/products/${saved.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ blockchainProductId: String(data.productId) })
            });
          }
        } catch {}
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

        <label>Commodity / Crop Name</label>
        <input
          type="text"
          value={cropCommodity}
          required
          onChange={(e) => handleCropCommodityChange(e.target.value)}
        />

        <label>Base Price (₹)</label>
        <input
          type="number"
          value={basePrice}
          required
          onChange={(e) => setBasePrice(e.target.value)}
        />

        <label>State</label>
        <input
          type="text"
          value={stateName}
          required
          onChange={e => setStateName(e.target.value)}
        />

        <label>District</label>
        <input
          type="text"
          value={district}
          required
          onChange={e => setDistrict(e.target.value)}
        />

        <label>Market</label>
        <input
          type="text"
          value={market}
          required
          onChange={e => setMarket(e.target.value)}
        />

        <button type="submit">Submit</button>

        {mlResult && (
          <div className="success-message" style={{ marginTop: 8 }}>
            <strong>ML Status:</strong> {mlResult.status} {mlResult.reason ? `- ${mlResult.reason}` : ''}
          </div>
        )}

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

      {qrDbId && (
        <div className="qr-section" style={{ marginTop: 16 }}>
          <p>🧾 Product Metadata QR (DB):</p>
          <QRCodeCanvas value={`${window.location.origin}/product/${qrDbId}`} size={180} />
        </div>
      )}
    </div>
  );
}

export default Farmer;
