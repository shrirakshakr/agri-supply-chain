import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error("Error:", err));
  }, [id]);

  if (!product) return <p>Loading product...</p>;

  return (
    <div className="detail-container">
      <h2>🌾 Crop: {product.name}</h2>
      <p><strong>Base Price:</strong> ₹{product.basePrice}</p>

      <h3>📈 Vendor Price History:</h3>
      <ul>
        {product.vendorPrices.length === 0 ? (
          <li>No vendor prices yet.</li>
        ) : (
          product.vendorPrices.map((vp, index) => (
            <li key={index}>
              ₹{vp.price} — {new Date(vp.updatedAt).toLocaleString()}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default ProductDetail;
