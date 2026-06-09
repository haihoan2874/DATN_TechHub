import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  FileText,
  Headphones,
  MessageSquare,
  RotateCcw,
  SlidersHorizontal,
  Truck
} from 'lucide-react';
import toast from 'react-hot-toast';

import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import { resolveApiAssetUrl } from '../../config/api';

import ProductGallery from './components/ProductGallery';
import ProductInfo from './components/ProductInfo';
import ProductSpecs from './components/ProductSpecs';
import RelatedProducts from './components/RelatedProducts';
import ProductFeatures from './components/ProductFeatures';
import ProductReviews from './components/ProductReviews';
import { formatCurrency } from '../../utils/formatters';

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
              pageNo: 0,
              pageSize: 4
            });
            const relatedItems = related.contents || related.data?.contents || related.content || related.data?.content || [];
            setRelatedProducts(relatedItems.filter((item) => item.id !== productData.id));
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
    window.addEventListener('scroll', handleScroll, { passive: true });
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
              <img
                src={resolveApiAssetUrl(product.imageUrl) || '/logo_final.png'}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="hidden min-w-0 sm:block">
              <h4 className="truncate text-sm font-semibold text-slate-900">{product.name}</h4>
              <p className="text-sm font-bold text-blue-600">{formatCurrency(product.price)}</p>
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

        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,560px)_minmax(420px,1fr)]">
            <div className="border-b border-slate-100 p-3 sm:p-5 lg:border-b-0 lg:border-r">
              <ProductGallery
                images={images}
                activeImage={activeImage}
                setActiveImage={setActiveImage}
                productName={product.name}
              />
            </div>

            <div className="p-4 sm:p-6">
              <ProductInfo
                product={product}
                quantity={quantity}
                setQuantity={setQuantity}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                cartAction={cartAction}
              />
            </div>
          </div>
        </section>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ServiceCard icon={BadgeCheck} title="Hàng chính hãng" description="Thông tin sản phẩm được chuẩn hóa theo từng thương hiệu." />
          <ServiceCard icon={Truck} title="Giao hàng toàn quốc" description="Hỗ trợ COD và thanh toán online khi đặt hàng." />
          <ServiceCard icon={RotateCcw} title="Đổi trả rõ ràng" description="Kiểm tra khi nhận, hỗ trợ theo chính sách sau bán." />
          <ServiceCard icon={Headphones} title="Tư vấn chọn mua" description="Hỗ trợ chọn thiết bị theo nhu cầu sử dụng thực tế." />
        </section>

        <div className="mb-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex min-w-max items-center gap-2">
            <DetailAnchor href="#product-description" icon={FileText} label="Mô tả" />
            <DetailAnchor href="#product-specs" icon={SlidersHorizontal} label="Thông số kỹ thuật" />
            <DetailAnchor href="#product-reviews" icon={MessageSquare} label="Đánh giá" />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
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

const DetailAnchor = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700"
  >
    <Icon size={16} />
    {label}
  </a>
);

const ServiceCard = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
      <Icon size={18} />
    </span>
    <div>
      <h3 className="text-sm font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  </div>
);

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
