import React, { useEffect, useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import productService from '../../../services/productService';
import EmptyState from '../../../components/feedback/EmptyState';

const ProductReviews = ({ productId, averageRating, reviewCount }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    productService.getReviews(productId)
      .then((res) => {
        setReviews(res.data || res);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Đánh giá sản phẩm</h2>
          <p className="mt-1 text-sm text-slate-500">Dựa trên {reviewCount || 0} lượt đánh giá sau mua hàng</p>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-5xl font-bold text-slate-950">{Number(averageRating || 0).toFixed(1)}</span>
            <div className="pb-1">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= Math.round(averageRating || 0) ? 'currentColor' : 'none'}
                    className={star <= Math.round(averageRating || 0) ? '' : 'text-slate-200'}
                  />
                ))}
              </div>
              <p className="mt-1 text-sm text-slate-500">Điểm trung bình</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-50" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-5">
            {reviews.map((review) => (
              <article key={review.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                      {review.userName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{review.userName || 'Khách hàng'}</h4>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 size={12} /> Đã mua hàng
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={14}
                        fill={index < review.rating ? 'currentColor' : 'none'}
                        className={index < review.rating ? '' : 'text-slate-200'}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Star}
            title="Chưa có đánh giá"
            description="Sản phẩm này chưa có đánh giá từ khách hàng đã mua."
          />
        )}
      </div>
    </section>
  );
};

export default ProductReviews;
