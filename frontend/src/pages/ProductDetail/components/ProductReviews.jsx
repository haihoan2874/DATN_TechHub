import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle2 } from 'lucide-react';
import productService from '../../../services/productService';

const ProductReviews = ({ productId, averageRating, reviewCount }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      productService.getReviews(productId)
        .then(res => {
          setReviews(res.data || res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [productId]);

  if (loading && reviews.length === 0) return (
    <div className="py-20 text-center">
       <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Đang tải đánh giá...</p>
    </div>
  );

  return (
    <section className="space-y-16 py-20 border-t border-slate-100">
      <div className="grid lg:grid-cols-3 gap-16 items-start">
        {/* Rating Summary */}
        <div className="space-y-8 sticky top-32">
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Đánh giá khách hàng</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dựa trên {reviewCount || 0} lượt đánh giá thực tế</p>
          </div>
          
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-black italic">{Number(averageRating || 0).toFixed(1)}</span>
            <div className="space-y-1">
               <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i <= Math.round(averageRating || 0) ? "currentColor" : "none"} 
                      className={i <= Math.round(averageRating || 0) ? "" : "text-slate-200"}
                    />
                  ))}
               </div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Rating trung bình</p>
            </div>
          </div>

          <div className="space-y-3">
             {[5, 4, 3, 2, 1].map((star) => (
               <div key={star} className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                 <span className="w-4">{star}★</span>
                 <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black" 
                      style={{ width: star === 5 ? '90%' : '5%' }} 
                    />
                 </div>
                 <span className="w-8 text-right">{star === 5 ? '90%' : '5%'}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Review List */}
        <div className="lg:col-span-2 space-y-12">
           {reviews.length > 0 ? (
             reviews.map((review) => (
              <div key={review.id} className="space-y-6 pb-12 border-b border-slate-50 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 uppercase italic">
                          {review.userName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black uppercase tracking-widest">{review.userName}</h4>
                              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                                <CheckCircle2 size={10} /> Đã mua hàng
                              </span>
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                    </div>
                    <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < review.rating ? "currentColor" : "none"}
                            className={i < review.rating ? "" : "text-slate-200"}
                          />
                        ))}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {review.comment}
                  </p>

                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                        <ThumbsUp size={12} /> Hữu ích (0)
                    </button>
                  </div>
              </div>
            ))
           ) : (
             <div className="py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Chưa có đánh giá nào cho sản phẩm này.</p>
             </div>
           )}

           {reviews.length > 5 && (
            <button className="w-full py-6 bg-white border-2 border-slate-900 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all duration-300">
                Xem thêm đánh giá
            </button>
           )}
        </div>
      </div>
    </section>
  );
};

export default ProductReviews;
