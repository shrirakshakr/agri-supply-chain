import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Farmer from './pages/Farmer';
import Vendor from './pages/Vendor';
import ProductDetail from './pages/ProductDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/farmer" element={<Farmer />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          {/* add /scan and others later */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
