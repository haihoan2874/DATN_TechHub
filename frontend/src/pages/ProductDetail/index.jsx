import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChevronRight, ArrowRight, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';

// Sub-components
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
  
  const mainRef = useRef(null);

  // Data Fetching
  useEffect(() => {
    const fetchFullProductData = async () => {
      setLoading(true);
      try {
        const response = await productService.getProductBySlug(slug);
        const productData = response.data || response;
        
        if (productData) {
          setProduct(productData);
          if (productData.categoryId) {
            const related = await productService.getAllProducts({ 
              categoryId: productData.categoryId, 
              pageSize: 4 
            });
            setRelatedProducts(related.content?.filter(p => p.id !== productData.id) || []);
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

  // Handle Sticky Bar Visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 800) setShowStickyBar(true);
      else setShowStickyBar(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Entrance Animations
  useGSAP(() => {
    if (!loading && product) {
      gsap.from('.reveal-item', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "expo.out",
        clearProps: "all"
      });
    }
  }, { scope: mainRef, dependencies: [loading, product] });

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

  const images = [product.imageUrl, product.imageUrl, product.imageUrl].filter(Boolean);

  return (
    <div ref={mainRef} className="bg-white min-h-screen pt-32 lg:pt-40 pb-20 overflow-x-hidden">
      {/* Sticky Action Bar */}
      <div className={`fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-xl border-b border-slate-100 py-4 transition-all duration-500 transform ${showStickyBar ? 'translate-y-0' : '-translate-y-full shadow-none'}`}>
        <div className="container mx-auto px-4 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-50 rounded-xl p-2 border border-slate-100">
                <img src={product.imageUrl} alt="sticky thumb" className="w-full h-full object-contain" />
             </div>
             <div className="hidden sm:block">
                <h4 className="text-[11px] font-black uppercase tracking-widest truncate max-w-[200px]">{product.name}</h4>
                <p className="text-[11px] font-black text-blue-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</p>
             </div>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={handleAddToCart}
              className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-black transition-all"
             >
                Mua ngay
             </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-12">
        {/* Breadcrumbs */}
        <nav className="reveal-item flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-16">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} className="opacity-30" />
          <Link to="/shop" className="hover:text-black transition-colors">Cửa hàng</Link>
          <ChevronRight size={10} className="opacity-30" />
          <span className="text-black font-black truncate max-w-[200px] italic">{product.name}</span>
        </nav>

        {/* 1. Main Stage (Immersive Intro) */}
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-28 mb-40 xl:mb-64">
          <div className="lg:w-1/2 reveal-item">
            <ProductGallery 
              images={images}
              activeImage={activeImage}
              setActiveImage={setActiveImage}
              productName={product.name}
            />
          </div>

          <div className="lg:w-1/2 reveal-item">
            <ProductInfo 
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>

        {/* 2. Detailed Specs & Landing Sections (Shopee Style) */}
        <div className="reveal-item mt-10 space-y-10">
           <ProductSpecs specs={product.specs} />
           <ProductFeatures features={product.features} />
        </div>

        {/* 4. Social Proof: Reviews (The Trust) */}
        <div className="reveal-item py-20 xl:py-40">
           <ProductReviews 
             productId={product.id} 
             averageRating={product.averageRating}
             reviewCount={product.reviewCount}
           />
        </div>

        {/* 5. Cross Selling (The Exploration) */}
        <div className="reveal-item pt-20 border-t border-slate-50">
          <RelatedProducts products={relatedProducts} />
        </div>
      </div>
    </div>
  );
};

// Internal Page Utilities
const LoadingSkeleton = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white">
    <div className="relative">
      <div className="w-16 h-16 border-2 border-slate-100 rounded-full" />
      <div className="w-16 h-16 border-t-2 border-black rounded-full animate-spin absolute top-0 left-0" />
    </div>
    <div className="text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">DATN TechHub</p>
      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Building Landing Experience...</p>
    </div>
  </div>
);

const NotFound = ({ navigate }) => (
  <div className="min-h-screen flex items-center justify-center bg-white px-6">
    <div className="text-center space-y-10 max-w-lg">
      <div className="text-[150px] font-black text-slate-50 leading-none italic select-none">404</div>
      <div className="space-y-4">
        <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Sản phẩm không tồn tại</h2>
        <p className="text-slate-500 font-medium leading-relaxed">Đường dẫn không chính xác hoặc sản phẩm đã ngừng kinh doanh.</p>
      </div>
      <Button 
        onClick={() => navigate('/shop')}
        icon={ArrowRight}
        className="px-10 h-14 rounded-full bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-black transition-all"
      >
        Quay lại cửa hàng
      </Button>
    </div>
  </div>
);

export default ProductDetail;
