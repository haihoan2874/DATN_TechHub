import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail/index';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import CategoryList from './pages/CategoryList';
import CategoryManagement from './pages/CategoryManagement';
import BrandManagement from './pages/BrandManagement';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import GuestRoute from './components/common/GuestRoute';
import UserManagement from './pages/UserManagement';
import ReviewManagement from './pages/ReviewManagement';
import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/login" element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              } />
              <Route path="/register" element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              } />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
              
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Admin Routes SPA */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="brands" element={<BrandManagement />} />
              <Route path="reviews" element={<ReviewManagement />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}


export default App;
