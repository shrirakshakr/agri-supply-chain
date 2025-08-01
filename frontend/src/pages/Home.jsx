import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <h1>Welcome to Agri Supply Chain System</h1>
      <p>Empowering Farmers. Ensuring Transparency. Delivering Trust.</p>

      <div className="cards">
        <Link to="/farmer" className="role-card">👨‍🌾 Farmer Portal</Link>
        <Link to="/vendor" className="role-card">🧑‍💼 Vendor Portal</Link>
        <Link to="/scan" className="role-card">🔍 Scan QR (Consumer)</Link>
      </div>
    </div>
  );
}

export default Home;
