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
  const [cartAction, setCartAction] = useState('');

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
    if (cartAction) return false;
    setCartAction('add');
    try {
      const result = await addToCart(product, quantity);
      if (!result.success) {
        toast.error(result.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        if (result.authRequired) {
          navigate('/login', { state: { from: location } });
        }
        return false;
      }
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
      return true;
    } finally {
      setCartAction('');
    }
  };

  const handleBuyNow = async () => {
    if (cartAction) return;
    setCartAction('buy');
    try {
      const result = await addToCart(product, quantity);
      if (!result.success) {
        toast.error(result.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        if (result.authRequired) {
          navigate('/login', { state: { from: location } });
        }
        return;
      }
      toast.success('Đã thêm sản phẩm, chuyển đến thanh toán');
      const checkoutProductIds = [product.id];
      sessionStorage.setItem('checkoutProductIds', JSON.stringify(checkoutProductIds));
      navigate('/checkout', { state: { selectedProductIds: checkoutProductIds } });
    } finally {
      setCartAction('');
    }
  };

  const handleStickyAddToCart = async () => {
    const added = await handleAddToCart();
    return added;
  };

  if (loading) return <LoadingSkeleton />;
  if (!product) return <NotFound navigate={navigate} />;

  const images = getProductImages(product);

  return (
    <div className="min-h-screen bg-slate-50 py-5 sm:py-7 lg:py-9">
      <div className={`fixed left-0 right-0 top-0 z-[60] border-b border-slate-200 bg-white/95 py-3 shadow-sm backdrop-blur transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1.5">
              <img src={product.imageUrl || '/logo_final.png'} alt={product.name} className="h-full w-full object-contain" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <h4 className="truncate text-sm font-semibold text-slate-900">{product.name}</h4>
              <p className="text-sm font-bold text-blue-600">{formatPrice(product.price)}</p>
            </div>
          </div>
          <Button type="button" onClick={handleStickyAddToCart} isLoading={cartAction === 'add'} disabled={Boolean(cartAction)}>
            Thêm vào giỏ
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <nav className="mb-4 flex items-center gap-2 overflow-hidden text-xs text-slate-500 sm:mb-5 sm:text-sm">
          <Link to="/" className="hover:text-slate-900">Trang chủ</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <Link to="/shop" className="hover:text-slate-900">Sản phẩm</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="truncate font-medium text-slate-900">{product.name}</span>
        </nav>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:gap-5 xl:grid-cols-[minmax(0,520px)_minmax(360px,1fr)]">
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
              onBuyNow={handleBuyNow}
              cartAction={cartAction}
            />
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-6">
          <div className="space-y-5">
            <ProductFeatures features={product.features} description={product.description} />
            <ProductReviews
              productId={product.id}
              averageRating={product.averageRating}
              reviewCount={product.reviewCount}
            />
          </div>
          <ProductSpecs specs={product.specs} />
        </div>

        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));
};

const getProductImages = (product) => {
  const imageSet = new Set();
  if (product.imageUrl) imageSet.add(product.imageUrl);

  const collectFeatureImages = (features) => {
    try {
      const parsed = typeof features === 'string' ? JSON.parse(features) : features;
      if (!Array.isArray(parsed)) return;
      parsed.forEach((block) => {
        if (block?.image) imageSet.add(block.image);
        if (Array.isArray(block?.images)) {
          block.images.forEach((image) => image && imageSet.add(image));
        }
      });
    } catch (error) {
      // Ignore invalid optional JSON. Main image is enough for display.
    }
  };

  collectFeatureImages(product.features);
  return Array.from(imageSet);
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
