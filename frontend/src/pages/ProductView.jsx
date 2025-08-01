import { useParams } from 'react-router-dom';

function ProductView() {
  const { id } = useParams();

  return (
    <div>
      <h2>Product Price History</h2>
      <p>Showing history for product ID: {id}</p>
    </div>
  );
}

export default ProductView;
