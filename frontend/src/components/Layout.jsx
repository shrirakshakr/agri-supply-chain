import { Outlet, Link } from 'react-router-dom';
import './Layout.css';

function Layout() {
  return (
    <>
      <header>
        <div className="logo">🌾 AgriChain</div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/farmer">Farmer</Link>
          <Link to="/vendor">Vendor</Link>
          <Link to="/scan">QR Scan</Link>
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
