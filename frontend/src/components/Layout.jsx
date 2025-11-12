import { Outlet, Link, useNavigate } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const navigate = useNavigate();
  let user = null;
  try {
    const raw = localStorage.getItem('agri_user');
    user = raw ? JSON.parse(raw) : null;
  } catch {}
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
          {/* Role-based nav gating */}
          {(!user || user.userType === 'Admin' || user.userType === 'Farmer') && (
            <Link to="/farmer" aria-disabled={user && user.userType === 'Vendor'} style={user && user.userType === 'Vendor' ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
              Farmer
            </Link>
          )}
          {(!user || user.userType === 'Admin' || user.userType === 'Vendor') && (
            <Link to="/vendor" aria-disabled={user && user.userType === 'Farmer'} style={user && user.userType === 'Farmer' ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
              Vendor
            </Link>
          )}
          <Link to="/products">Products</Link>
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
