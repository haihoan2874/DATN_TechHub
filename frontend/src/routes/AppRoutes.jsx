import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import GuestRoute from '../components/common/GuestRoute';
import PageLoader from '../components/common/PageLoader';

const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const About = lazy(() => import('../pages/About'));
const ProductDetail = lazy(() => import('../pages/ProductDetail/index'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const VerifyOtp = lazy(() => import('../pages/VerifyOtp'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
const OrderDetail = lazy(() => import('../pages/OrderDetail'));
const OAuth2RedirectHandler = lazy(() => import('../pages/OAuth2RedirectHandler'));
const CategoryList = lazy(() => import('../pages/CategoryList'));
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));

const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const ProductManagement = lazy(() => import('../pages/ProductManagement'));
const OrderManagement = lazy(() => import('../pages/OrderManagement'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const CategoryManagement = lazy(() => import('../pages/CategoryManagement'));
const BrandManagement = lazy(() => import('../pages/BrandManagement'));
const ReviewManagement = lazy(() => import('../pages/ReviewManagement'));
const VoucherManagement = lazy(() => import('../pages/VoucherManagement'));
const StockImportManagement = lazy(() => import('../pages/StockImportManagement'));

const withGuestRoute = (element) => <GuestRoute>{element}</GuestRoute>;
const withProtectedRoute = (element) => <ProtectedRoute>{element}</ProtectedRoute>;
const withAdminRoute = (element) => <ProtectedRoute adminOnly>{element}</ProtectedRoute>;

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/login" element={withGuestRoute(<Login />)} />
        <Route path="/register" element={withGuestRoute(<Register />)} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={withProtectedRoute(<Checkout />)} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/profile" element={withProtectedRoute(<Profile />)} />
        <Route path="/orders" element={withProtectedRoute(<Orders />)} />
        <Route path="/orders/:id" element={withProtectedRoute(<OrderDetail />)} />
      </Route>

      <Route path="/admin" element={withAdminRoute(<AdminLayout />)}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="brands" element={<BrandManagement />} />
        <Route path="reviews" element={<ReviewManagement />} />
        <Route path="vouchers" element={<VoucherManagement />} />
        <Route path="stock-imports" element={<StockImportManagement />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AppRoutes;
