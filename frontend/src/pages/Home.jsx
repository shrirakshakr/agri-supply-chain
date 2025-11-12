import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  let user = null;
  try {
    const raw = localStorage.getItem('agri_user');
    user = raw ? JSON.parse(raw) : null;
  } catch {}

  return (
    <div className="home">
      <h1>Welcome to Agri Supply Chain System</h1>
      <p>Empowering Farmers. Ensuring Transparency. Delivering Trust.</p>

      <div className="cards">
        {(user?.userType !== 'Vendor') && (
          <Link to="/farmer" className="role-card">👨‍🌾 Farmer Portal</Link>
        )}
        {(user?.userType !== 'Farmer') && (
          <Link to="/vendor" className="role-card">🧑‍💼 Vendor Portal</Link>
        )}
        <Link to="/scan" className="role-card">🔍 Scan QR (Consumer)</Link>
        <Link to="/products" className="role-card">🧾 Products</Link>
      </div>
    </div>
  );
}

export default Home;
