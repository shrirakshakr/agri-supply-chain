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
    // Always fetch from blockchain (backend handles both numeric IDs and MongoDB ObjectIds)
    fetch(`http://localhost:3000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error || data.message === 'Not found') {
          setError(data.error || data.message || 'Not found');
        } else {
          setProduct(data);
        }
      })
      .catch(() => setError('Failed to load product'));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Loading...</p>;

  // All product data now comes from blockchain
  return (
    <div className="product-detail">
      <h2>Product Details</h2>
      <p><strong>Blockchain Product ID:</strong> {product.blockchainProductId || id}</p>
      <p><strong>Crop/Commodity Name:</strong> {product.name}</p>
      <p><strong>Base Price:</strong> ₹{product.basePrice}</p>
      <p><strong>State:</strong> {product.state}</p>
      <p><strong>District:</strong> {product.district}</p>
      <p><strong>Market:</strong> {product.market}</p>
      <p><strong>Farmer Address:</strong> {product.farmer}</p>

      {product.txHash && (
        <p><strong>Transaction Hash:</strong> {product.txHash}</p>
      )}

      {product.mlVerificationStatus && (
        <>
          <p><strong>ML Verification Status:</strong> {product.mlVerificationStatus}</p>
          {product.mlReason && <p><strong>ML Reason:</strong> {product.mlReason}</p>}
          {product.marketModalPrice > 0 && (
            <p><strong>Market Modal Price:</strong> ₹{product.marketModalPrice}</p>
          )}
        </>
      )}

      <h3>📈 Vendor Price Trail</h3>
      <ul>
        {product.priceTrail && product.priceTrail.length === 0 ? (
          <li>No vendor prices yet.</li>
        ) : (
          product.priceTrail?.map((price, index) => (
            <li key={index}>
              ₹{price} by {product.handlers?.[index] || 'Unknown'}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default ProductDetail;
