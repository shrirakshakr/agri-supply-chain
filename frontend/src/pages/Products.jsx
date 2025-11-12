import { useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE } from '../api';
import { QRCodeCanvas } from 'qrcode.react';

const AG_API = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const AG_KEY = '579b464db66ec23bdd000001c3a5347951df4af851d6db109e149101';

function Products() {
  const [commodity, setCommodity] = useState('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [market, setMarket] = useState('');
  const [vendorPrice, setVendorPrice] = useState('');
  const [options, setOptions] = useState({ commodities: [], states: [], districts: [], markets: [] });
  const [checkResult, setCheckResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [qrId, setQrId] = useState('');
  const qrRef = useRef();

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('agri_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Preload commodities and states lists from API
    async function load() {
      try {
        const res = await fetch(`${AG_API}?api-key=${AG_KEY}&format=json&limit=1000`);
        const data = await res.json();
        const rows = data.records || [];
        const commodities = Array.from(new Set(rows.map(r => (r.commodity || '').trim()))).filter(Boolean).sort();
        const states = Array.from(new Set(rows.map(r => (r.state || '').trim()))).filter(Boolean).sort();
        setOptions(prev => ({ ...prev, commodities, states, rows }));
      } catch (e) {
        // fail silently, user can retry
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!stateName || !options.rows) {
      setOptions(prev => ({ ...prev, districts: [], markets: [] }));
      setDistrict('');
      setMarket('');
      return;
    }
    const districts = Array.from(new Set(options.rows.filter(r => (r.state || '').trim() === stateName).map(r => (r.district || '').trim()))).filter(Boolean).sort();
    setOptions(prev => ({ ...prev, districts, markets: [] }));
    setDistrict('');
    setMarket('');
  }, [stateName, options.rows]);

  useEffect(() => {
    if (!stateName || !district || !options.rows) {
      setOptions(prev => ({ ...prev, markets: [] }));
      setMarket('');
      return;
    }
    const markets = Array.from(new Set(options.rows.filter(r =>
      (r.state || '').trim() === stateName && (r.district || '').trim() === district
    ).map(r => (r.market || '').trim()))).filter(Boolean).sort();
    setOptions(prev => ({ ...prev, markets }));
    setMarket('');
  }, [district, stateName, options.rows]);

  async function handleCheck(e) {
    e.preventDefault();
    setCheckResult(null);
    setQrId('');
    if (!commodity || !stateName || !district || !market || !vendorPrice) return;
    try {
      const res = await fetch(`${API_BASE}/check-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity,
          state: stateName,
          district,
          market,
          vendor_price: Number(vendorPrice)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Price check failed');
      setCheckResult(data);
      if (data.status === 'accept') {
        setSaving(true);
        const saveRes = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commodity,
            state: stateName,
            district,
            market,
            vendorPrice: Number(vendorPrice),
            marketModalPrice: data.market_modal_price,
            status: data.status,
            reason: data.reason,
            submitterName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
            submitterRole: user?.userType || '',
            submitterId: user?.uniqueId || ''
          })
        });
        const saved = await saveRes.json();
        setSaving(false);
        if (saveRes.ok) {
          setQrId(saved.id);
        }
      }
    } catch (e) {
      setCheckResult({ status: 'error', reason: e.message });
    }
  }

  const qrUrl = useMemo(() => (qrId ? `${window.location.origin}/product/${qrId}` : ''), [qrId]);

  return (
    <div className="vendor-container">
      <form onSubmit={handleCheck} className="vendor-form">
        <h2>Products: Verify Price and Generate QR</h2>

        <label>Commodity</label>
        <select value={commodity} onChange={e => setCommodity(e.target.value)} required>
          <option value="">-- Select --</option>
          {options.commodities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>State</label>
        <select value={stateName} onChange={e => setStateName(e.target.value)} required>
          <option value="">-- Select --</option>
          {options.states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label>District</label>
        <select value={district} onChange={e => setDistrict(e.target.value)} required disabled={!stateName}>
          <option value="">-- Select --</option>
          {options.districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <label>Market</label>
        <select value={market} onChange={e => setMarket(e.target.value)} required disabled={!district}>
          <option value="">-- Select --</option>
          {options.markets.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <label>Vendor Price (₹)</label>
        <input type="number" value={vendorPrice} onChange={e => setVendorPrice(e.target.value)} required />

        <button type="submit" disabled={saving}>Check & Save</button>

        {checkResult && (
          <div className="success-message" style={{ marginTop: 12 }}>
            <strong>Status:</strong> {checkResult.status}<br />
            {checkResult.reason && (<><strong>Reason:</strong> {checkResult.reason}<br /></>)}
            {typeof checkResult.market_modal_price !== 'undefined' && (
              <>
                <strong>Market Modal:</strong> ₹{checkResult.market_modal_price}<br />
                <strong>Vendor Price:</strong> ₹{checkResult.vendor_price}
              </>
            )}
          </div>
        )}
      </form>

      {qrId && (
        <div className="qr-section" ref={qrRef} style={{ marginTop: 16 }}>
          <p>📦 Product QR Code:</p>
          <QRCodeCanvas value={qrUrl} size={180} />
        </div>
      )}
    </div>
  );
}

export default Products;


