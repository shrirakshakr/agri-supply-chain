import { Outlet, Link, useNavigate } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const navigate = useNavigate();
  function handleLogout() {
    localStorage.removeItem('agri_user');
    navigate('/login');
  }

  return (
    <>
      <header>
        <div className="logo">🌾 AgriChain</div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/farmer">Farmer</Link>
          <Link to="/vendor">Vendor</Link>
          <Link to="/scan">QR Scan</Link>
          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>Logout</button>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <p>© 2025 Agricultural Supply Chain | Team 9 | Final Year Project</p>
      </footer>
    </>
  );
}

export default Layout;
