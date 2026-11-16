import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ContactPage from './pages/ContactPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin w-9 h-9 border-[3px] border-brand-500 border-t-transparent rounded-full" />
        <p className="text-sm font-medium text-muted">Loading…</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Navigate to="/" /> : children;
}

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-cream texture-grid px-4">
      <div className="text-center">
        <p className="font-display text-7xl md:text-8xl font-extrabold text-brand-500 tracking-tight mb-3">404</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-2">Page Not Found</h1>
        <p className="text-muted mb-8 max-w-md mx-auto text-sm">The page you are looking for doesn't exist or has been moved. Let's get you back to shopping.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary btn-lg">Go Home</Link>
          <Link to="/products" className="btn-outline btn-lg">Browse Products</Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontFamily: 'Inter, sans-serif', background: '#0a1b30', color: '#f1f5f9', border: '1px solid #1a3a61', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.6)' },
              success: { iconTheme: { primary: '#15803d', secondary: '#fff' } },
              error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="coupons" element={<AdminCoupons />} />
            </Route>

            {/* Public Routes with Navbar/Footer */}
            <Route path="/" element={<><Navbar /><main className="min-h-[60vh]"><HomePage /></main><Footer /></>} />
            <Route path="/products" element={<><Navbar /><main><ProductsPage /></main><Footer /></>} />
            <Route path="/product/:slug" element={<><Navbar /><main><ProductDetailPage /></main><Footer /></>} />
            <Route path="/contact" element={<><Navbar /><main><ContactPage /></main><Footer /></>} />

            {/* Auth Routes */}
            <Route path="/login" element={<PublicRoute><><Navbar /><LoginPage /><Footer /></></PublicRoute>} />

            {/* Protected Routes */}
            <Route path="/cart" element={<ProtectedRoute><><Navbar /><CartPage /><Footer /></></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><><Navbar /><CheckoutPage /><Footer /></></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><><Navbar /><AccountPage /><Footer /></></ProtectedRoute>} />
            <Route path="/account/orders" element={<ProtectedRoute><><Navbar /><AccountPage /><Footer /></></ProtectedRoute>} />
            <Route path="/account/orders/:id" element={<ProtectedRoute><><Navbar /><OrderDetailPage /><Footer /></></ProtectedRoute>} />
            <Route path="/account/wishlist" element={<ProtectedRoute><><Navbar /><AccountPage /><Footer /></></ProtectedRoute>} />

            <Route path="*" element={<><Navbar /><main><NotFoundPage /></main><Footer /></>} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
