import React, { useMemo, useState, useEffect } from 'react';
import { 
  Star, MessageSquare, Trash2,
  Search, RefreshCw,
  Package, CheckCircle2, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import ConfirmModal from '../components/ui/ConfirmModal';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import Toolbar from '../components/layout/Toolbar';
import DataTable from '../components/data/DataTable';
import MetricCard from '../components/data/MetricCard';
import Pagination from '../components/data/Pagination';
import EmptyState from '../components/feedback/EmptyState';

const PAGE_SIZE = 8;

const tableColumns = [
  { key: 'product', label: 'Sản phẩm' },
  { key: 'customer', label: 'Khách hàng' },
  { key: 'rating', label: 'Đánh giá' },
  { key: 'content', label: 'Nội dung' },
  { key: 'createdAt', label: 'Ngày tạo' },
  { key: 'actions', label: 'Thao tác', className: 'text-right' }
];

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Selection & Actions
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllReviews();
      setReviews(response.data || response);
    } catch (error) {
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    try {
      await adminService.deleteReview(selectedReview.id);
      toast.success('Đã xóa đánh giá thành công');
      setShowDeleteModal(false);
      fetchReviews();
    } catch (error) {
      toast.error('Lỗi khi xóa đánh giá');
    }
  };

  const metrics = useMemo(() => {
    const averageRating = (reviews.reduce((acc, review) => acc + review.rating, 0) / (reviews.length || 1)).toFixed(1);
    return [
      { label: 'Tổng đánh giá', value: reviews.length, icon: MessageSquare, tone: 'blue' },
      { label: 'Đánh giá 5 sao', value: reviews.filter((review) => review.rating === 5).length, icon: Star, tone: 'amber' },
      { label: 'Điểm trung bình', value: averageRating, icon: CheckCircle2, tone: 'green' },
      { label: 'Cần xử lý', value: reviews.filter((review) => review.rating <= 2).length, icon: XCircle, tone: 'red' }
    ];
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return reviews.filter(review => {
      const matchesSearch =
        !keyword ||
        review.productName?.toLowerCase().includes(keyword) ||
        review.userName?.toLowerCase().includes(keyword) ||
        review.comment?.toLowerCase().includes(keyword);
      const matchesRating = filterRating === 'ALL' || review.rating === parseInt(filterRating, 10);
      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, filterRating]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredReviews.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredReviews, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRating]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={12} 
            className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
          />
        ))}
      </div>
    );
  };

  return (
    <PageShell>
      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteReview}
        title="Xác nhận xóa đánh giá"
        message="Hành động này sẽ xóa vĩnh viễn đánh giá của khách hàng khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?"
        variant="danger"
      />

      <PageHeader
        eyebrow="Trải nghiệm khách hàng"
        title="Đánh giá"
        description="Theo dõi phản hồi sản phẩm và xóa các đánh giá không phù hợp khi cần."
        icon={Star}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <Toolbar>
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo sản phẩm, người dùng, nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="flex w-full items-center gap-2 overflow-x-auto lg:w-auto">
              {['ALL', '5', '4', '3', '2', '1'].map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRating(r)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    filterRating === r
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r === 'ALL' ? 'Tất cả' : (
                    <>
                      {r} <Star size={10} className="fill-current" />
                    </>
                  )}
                </button>
              ))}
        </div>
        <span className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          {filteredReviews.length} đánh giá
        </span>
        <button onClick={fetchReviews} className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </Toolbar>

      <DataTable
        columns={tableColumns}
        footer={!loading && filteredReviews.length > 0 ? (
          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredReviews.length}
            onPageChange={setCurrentPage}
          />
        ) : null}
      >
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-5 py-4"><div className="h-5 w-full rounded bg-slate-100"></div></td>
                  </tr>
                ))
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="6"><EmptyState title="Không có đánh giá" description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm." /></td>
                </tr>
              ) : (
                paginatedReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                           <Package size={20} className="text-slate-400" />
                        </div>
                        <div>
                          <div className="max-w-52 truncate text-sm font-semibold leading-tight text-slate-950">
                            {review.productName}
                          </div>
                          <div className="mt-1 text-xs font-medium text-slate-400">ID: {review.productId?.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                          {review.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-semibold text-slate-700">{review.userName}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {renderStars(review.rating)}
                        <div className="text-xs font-semibold text-amber-600">{review.rating} / 5</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-xs">
                        <p className="line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">
                          {review.comment || 'Không có nội dung'}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-500">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedReview(review); setShowDeleteModal(true); }}
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                          title="Xóa đánh giá"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
      </DataTable>
    </PageShell>
  );
};

export default ReviewManagement;
