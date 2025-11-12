import { useEffect, useMemo, useState } from 'react';
import './Vendor.css';
import { API_BASE } from '../api';

function Vendor() {
  // Cascading dropdowns sourced from backend (based on farmer-added, on-chain linked products)
  const [commodities, setCommodities] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [markets, setMarkets] = useState([]);

  const [commodity, setCommodity] = useState('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [market, setMarket] = useState('');

  const [vendorPrice, setVendorPrice] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isFormReady = useMemo(() =>
    commodity && stateName && district && market && vendorPrice, [commodity, stateName, district, market, vendorPrice]);

  useEffect(() => {
    async function loadCommodities() {
      setErrorMsg('');
      try {
        const res = await fetch(`${API_BASE}/options/commodities`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load commodities');
        setCommodities(data);
      } catch (e) {
        setErrorMsg(e.message);
      }
    }
    loadCommodities();
  }, []);

  useEffect(() => {
    async function loadStates() {
      setStates([]);
      setDistricts([]);
      setMarkets([]);
      setStateName('');
      setDistrict('');
      setMarket('');
      if (!commodity) return;
      try {
        const res = await fetch(`${API_BASE}/options/states?commodity=${encodeURIComponent(commodity)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load states');
        setStates(data);
      } catch (e) {
        setErrorMsg(e.message);
      }
    }
    loadStates();
  }, [commodity]);

  useEffect(() => {
    async function loadDistricts() {
      setDistricts([]);
      setMarkets([]);
      setDistrict('');
      setMarket('');
      if (!commodity || !stateName) return;
      try {
        const url = `${API_BASE}/options/districts?commodity=${encodeURIComponent(commodity)}&state=${encodeURIComponent(stateName)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load districts');
        setDistricts(data);
      } catch (e) {
        setErrorMsg(e.message);
      }
    }
    loadDistricts();
  }, [commodity, stateName]);

  useEffect(() => {
    async function loadMarkets() {
      setMarkets([]);
      setMarket('');
      if (!commodity || !stateName || !district) return;
      try {
        const url = `${API_BASE}/options/markets?commodity=${encodeURIComponent(commodity)}&state=${encodeURIComponent(stateName)}&district=${encodeURIComponent(district)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load markets');
        setMarkets(data);
      } catch (e) {
        setErrorMsg(e.message);
      }
    }
    loadMarkets();
  }, [commodity, stateName, district]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!isFormReady) return;
    try {
      // Resolve selected combo to DB product with blockchainProductId
      const q = new URLSearchParams({
        commodity,
        state: stateName,
        district,
        market
      }).toString();
      const res = await fetch(`${API_BASE}/products/match?${q}`);
      const match = await res.json();
      if (!res.ok) throw new Error(match?.message || 'No matching product found');
      const productId = match.blockchainProductId;
      if (!productId) throw new Error('Missing blockchain product ID for selection');

      // Submit vendor price update to blockchain
      const upRes = await fetch(`${API_BASE}/products/vendor/update-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, newPrice: Number(vendorPrice) })
      });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData?.error || 'Failed to update price');

      setSuccessMsg(`✅ ${upData.message}`);
      setVendorPrice('');
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  return (
    <div className="vendor-container">
      <form onSubmit={handleSubmit} className="vendor-form">
        <h2>Vendor: Update Commodity/Crop Price</h2>

        <label>Commodity/Crop</label>
        <select value={commodity} onChange={e => setCommodity(e.target.value)} required>
          <option value="">-- Select --</option>
          {commodities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>State</label>
        <select value={stateName} onChange={e => setStateName(e.target.value)} required disabled={!commodity}>
          <option value="">-- Select --</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label>District</label>
        <select value={district} onChange={e => setDistrict(e.target.value)} required disabled={!stateName}>
          <option value="">-- Select --</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <label>Market</label>
        <select value={market} onChange={e => setMarket(e.target.value)} required disabled={!district}>
          <option value="">-- Select --</option>
          {markets.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <label>Vendor Price (₹)</label>
        <input
          type="number"
          value={vendorPrice}
          onChange={(e) => setVendorPrice(e.target.value)}
          required
        />

        <button type="submit" disabled={!isFormReady}>Submit Price</button>

        {successMsg && <p className="success-message">{successMsg}</p>}
        {errorMsg && <p className="error">{errorMsg}</p>}
      </form>
    </div>
  );
}

export default Vendor;
