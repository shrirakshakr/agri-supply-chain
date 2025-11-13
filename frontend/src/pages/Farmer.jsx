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
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [market, setMarket] = useState('');
  const [mlResult, setMlResult] = useState(null);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSuccessMsg('');
      setProductId(null);
      setMlResult(null);

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

      // First: ML price check
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

      // Store ALL details on blockchain
      const response = await fetch(`${API_BASE}/products/farmer/add-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cc,
          basePrice: bpNum,
          state: st,
          district: dt,
          market: mk
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSuccessMsg(`❌ ${data.error || 'Failed to add product to blockchain.'}`);
        return;
      }

      // Store QR mapping in MongoDB (only mapping, not product data)
      const qrCodeUrl = `${window.location.origin}/product/${data.productId}`;
      try {
        await fetch(`${API_BASE}/products/qr-mapping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blockchainProductId: data.productId,
            txHash: data.txHash,
            qrCodeUrl: qrCodeUrl,
            mlVerificationStatus: checkData.status,
            mlReason: checkData.reason,
            marketModalPrice: checkData.market_modal_price
          })
        });
      } catch (err) {
        console.warn('QR mapping save failed (non-critical):', err);
      }

      setSuccessMsg(`✅ ${data.message}`);
      setProductId(data.productId);
      setCropCommodity('');
      setBasePrice('');
      setStateName('');
      setDistrict('');
      setMarket('');
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
          min={1}
          step={1}
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
          <p>📦 Crop QR Code:</p>
          <QRCodeCanvas
            value={`${window.location.origin}/product/${productId}`}
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
