import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3000/api/products/product/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setProduct(data);
      });
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Loading...</p>;

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

export default ProductDetail;
