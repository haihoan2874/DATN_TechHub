import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';

import ProductGallery from './components/ProductGallery';
import ProductInfo from './components/ProductInfo';
import ProductSpecs from './components/ProductSpecs';
import RelatedProducts from './components/RelatedProducts';
import ProductFeatures from './components/ProductFeatures';
import ProductReviews from './components/ProductReviews';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const fetchFullProductData = async () => {
      setLoading(true);
      try {
        const response = await productService.getProductBySlug(slug);
        const productData = response.data || response;

        if (productData) {
          setProduct(productData);
          setQuantity(1);
          setActiveImage(0);

          if (productData.categoryId) {
            const related = await productService.getAllProducts({
              categoryId: productData.categoryId,
              pageSize: 4
            });
            setRelatedProducts(related.content?.filter((item) => item.id !== productData.id) || []);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchFullProductData();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 720);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = async () => {
    const result = await addToCart(product, quantity);
    if (!result.success) {
      toast.error(result.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      if (result.authRequired) {
        navigate('/login', { state: { from: location } });
      }
      return;
    }
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  if (loading) return <LoadingSkeleton />;
  if (!product) return <NotFound navigate={navigate} />;

  const images = [product.imageUrl].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 lg:pt-32">
      <div className={`fixed left-0 right-0 top-0 z-[60] border-b border-slate-200 bg-white/95 py-3 shadow-sm backdrop-blur transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto flex items-center justify-between gap-4 px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1.5">
              <img src={product.imageUrl || '/logo_final.png'} alt={product.name} className="h-full w-full object-contain" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <h4 className="truncate text-sm font-semibold text-slate-900">{product.name}</h4>
              <p className="text-sm font-bold text-blue-600">{formatPrice(product.price)}</p>
            </div>
          </div>
          <Button onClick={handleAddToCart}>
            Thêm vào giỏ
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900">Trang chủ</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <Link to="/shop" className="hover:text-slate-900">Sản phẩm</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="truncate font-medium text-slate-900">{product.name}</span>
        </nav>

        <div className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,480px)] lg:items-start">
          <ProductGallery
            images={images}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            productName={product.name}
          />

          <ProductInfo
            product={product}
            quantity={quantity}
            setQuantity={setQuantity}
            onAddToCart={handleAddToCart}
          />
        </div>

        <div className="space-y-8">
          <ProductSpecs specs={product.specs} />
          <ProductFeatures features={product.features} />
          <ProductReviews
            productId={product.id}
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
          />
          <RelatedProducts products={relatedProducts} />
        </div>
      </div>
    </div>
  );
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));
};

const LoadingSkeleton = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
    <p className="text-sm font-medium text-slate-500">Đang tải thông tin sản phẩm...</p>
  </div>
);

const NotFound = ({ navigate }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold text-slate-500">404</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">Sản phẩm không tồn tại</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">Đường dẫn không chính xác hoặc sản phẩm đã ngừng kinh doanh.</p>
      <Button onClick={() => navigate('/shop')} icon={ArrowRight} iconPosition="right" className="mt-6">
        Quay lại cửa hàng
      </Button>
    </div>
  </div>
);

export default ProductDetail;
