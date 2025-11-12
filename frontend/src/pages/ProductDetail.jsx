import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('blockchain'); // or 'db'

  useEffect(() => {
    setProduct(null);
    setError('');
    const isNumeric = /^\d+$/.test(id);
    setMode(isNumeric ? 'blockchain' : 'db');
    const url = isNumeric
      ? `http://localhost:3000/api/products/product/${id}`
      : `http://localhost:3000/api/products/${id}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.error || data.message === 'Not found') setError(data.error || data.message || 'Not found');
        else setProduct(data);
      })
      .catch(() => setError('Failed to load product'));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Loading...</p>;

  if (mode === 'blockchain') {
    return (
      <div className="product-detail">
        <h2>Product ID: {id}</h2>
        <p><strong>Crop Name:</strong> {product.name}</p>
        <p><strong>Base Price:</strong> ₹{product.basePrice}</p>
        <p><strong>Farmer:</strong> {product.farmer}</p>

        <h3>📈 Vendor Price Trail</h3>
        <ul>
          {product.priceTrail.length === 0 ? (
            <li>No vendor prices yet.</li>
          ) : (
            product.priceTrail.map((price, index) => (
              <li key={index}>
                ₹{price} by {product.handlers[index]}
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  // DB-backed product (QR consumer view)
  return (
    <div className="product-detail">
      <h2>Product</h2>
      <p><strong>Commodity:</strong> {product.commodity}</p>
      <p><strong>State:</strong> {product.state}</p>
      <p><strong>District:</strong> {product.district}</p>
      <p><strong>Market:</strong> {product.market}</p>
      <p><strong>Market Modal Price:</strong> ₹{product.marketModalPrice}</p>
      <p><strong>Entered Vendor Price:</strong> ₹{product.vendorPrice}</p>
      <p><strong>Status:</strong> {product.status}</p>
      <p><strong>Reason:</strong> {product.reason}</p>
      {product.submitterName && (
        <p><strong>Submitted by:</strong> {product.submitterName} {product.submitterRole ? `(${product.submitterRole})` : ''}</p>
      )}
      {product.blockchainProductId && (
        <p><strong>Blockchain Product ID:</strong> {product.blockchainProductId}</p>
      )}
    </div>
  );
}

export default ProductDetail;
