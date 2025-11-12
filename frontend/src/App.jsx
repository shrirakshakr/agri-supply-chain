import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Farmer from './pages/Farmer';
import Vendor from './pages/Vendor';
import ScanQR from './pages/ScanQR';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPage from './pages/AdminPage';
import Products from './pages/Products';

function getStoredUser() {
	try {
		const raw = localStorage.getItem('agri_user');
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function RequireAuth({ children }) {
	const user = getStoredUser();
	if (!user) {
		return <Navigate to="/login" replace />;
	}
	return children;
}

function RequireAdmin({ children }) {
	const user = getStoredUser();
	if (!user || user.userType !== 'Admin') {
		return <Navigate to="/" replace />;
	}
	return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Home />} />
          <Route path="/farmer" element={<Farmer />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/products" element={<Products />} />
          <Route path="scan" element={<ScanQR />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
