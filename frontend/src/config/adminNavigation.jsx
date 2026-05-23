import {
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  Tag,
  TicketPercent,
  Users
} from 'lucide-react';

export const adminNavigation = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { path: '/admin/products', icon: Package, label: 'Sản phẩm' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { path: '/admin/users', icon: Users, label: 'Người dùng' },
  { path: '/admin/categories', icon: Tag, label: 'Danh mục' },
  { path: '/admin/brands', icon: ImageIcon, label: 'Thương hiệu' },
  { path: '/admin/reviews', icon: Star, label: 'Đánh giá' },
  { path: '/admin/vouchers', icon: TicketPercent, label: 'Voucher' }
];
